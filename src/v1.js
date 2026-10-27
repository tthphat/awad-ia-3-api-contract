// The /v1 API. Implemented from CONTRACT.md.
import { readRaw } from './http.js';

function sendProblem(res, status, slug, title, detail, errors = null) {
  const body = {
    type: `https://menu.example/problems/${slug}`,
    title,
    status,
    detail,
  };
  if (errors && errors.length > 0) {
    body.errors = errors;
  }
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/problem+json',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function canonicalize(val) {
  if (val === null || typeof val !== 'object') {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return '[' + val.map(canonicalize).join(',') + ']';
  }
  const keys = Object.keys(val).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(val[k])).join(',') + '}';
}

export function createV1(db) {
  const q = {
    getMenuItem: db.prepare('SELECT id, name, price_vnd FROM menu_items WHERE id = ?'),
    getOrder: db.prepare('SELECT id, table_id, total_vnd, created_at FROM orders WHERE id = ?'),
    getOrderItems: db.prepare('SELECT line, menu_item_id, qty, unit_price_vnd FROM order_items WHERE order_id = ? ORDER BY line ASC'),
    insertOrder: db.prepare('INSERT INTO orders (table_id, total_vnd, created_at) VALUES (?, ?, ?)'),
    insertOrderItem: db.prepare('INSERT INTO order_items (order_id, line, menu_item_id, qty, unit_price_vnd) VALUES (?, ?, ?, ?, ?)'),
    getIdempotency: db.prepare('SELECT key, fingerprint, status, location, body, created_at FROM idempotency_keys WHERE key = ?'),
    insertIdempotencyInFlight: db.prepare('INSERT INTO idempotency_keys (key, fingerprint, status, created_at) VALUES (?, ?, 0, ?)'),
    updateIdempotencyDone: db.prepare('UPDATE idempotency_keys SET status = 201, location = ?, body = ? WHERE key = ?'),
    deleteIdempotency: db.prepare('DELETE FROM idempotency_keys WHERE key = ? AND status = 0'),
    listOrdersAll: db.prepare('SELECT id, table_id, total_vnd, created_at FROM orders ORDER BY id DESC LIMIT ?'),
    listOrdersCursor: db.prepare('SELECT id, table_id, total_vnd, created_at FROM orders WHERE id < ? ORDER BY id DESC LIMIT ?'),
    listOrdersTable: db.prepare('SELECT id, table_id, total_vnd, created_at FROM orders WHERE table_id = ? ORDER BY id DESC LIMIT ?'),
    listOrdersTableCursor: db.prepare('SELECT id, table_id, total_vnd, created_at FROM orders WHERE table_id = ? AND id < ? ORDER BY id DESC LIMIT ?'),
  };

  return async function handleV1(req, res, url) {
    try {
      const parts = url.pathname.replace(/^\/v1\/?/, '').split('/').filter(Boolean);

      // GET /v1/menu/{id}
      if (parts[0] === 'menu' && parts.length === 2 && req.method === 'GET') {
        const idStr = parts[1];
        const id = Number(idStr);
        if (!Number.isInteger(id) || id <= 0) {
          sendProblem(res, 404, 'not-found', 'Not found', `menu item ${idStr} not found`);
          return true;
        }
        const item = q.getMenuItem.get(id);
        if (!item) {
          sendProblem(res, 404, 'not-found', 'Not found', `menu item ${id} not found`);
          return true;
        }
        const payload = JSON.stringify({
          id: item.id,
          name: item.name,
          priceVnd: item.price_vnd,
        });
        res.writeHead(200, {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        });
        res.end(payload);
        return true;
      }

      // POST /v1/orders
      if (parts[0] === 'orders' && parts.length === 1 && req.method === 'POST') {
        // Step 1: Idempotency-Key header check
        const key = req.headers['idempotency-key'];
        if (key === undefined || typeof key !== 'string' || key.length === 0 || key.length > 255) {
          sendProblem(res, 400, 'idempotency-key-missing', 'Idempotency-Key required',
            'Idempotency-Key header is required and must be 1 to 255 characters');
          return true;
        }

        // Step 2: Valid JSON body
        const rawBody = await readRaw(req);
        let body;
        try {
          body = JSON.parse(rawBody || '');
        } catch {
          sendProblem(res, 400, 'invalid-json', 'Malformed JSON', 'the body is not valid JSON');
          return true;
        }

        // Step 3: Key check (replay, reused, or in-flight)
        const fingerprint = canonicalize(body);
        let existing = q.getIdempotency.get(key);
        if (existing) {
          if (existing.status === 0) {
            sendProblem(res, 409, 'idempotency-key-in-flight', 'Request in progress',
              'the first request with this key has not finished yet');
            return true;
          }
          if (existing.status === 201) {
            if (existing.fingerprint === fingerprint) {
              const payload = existing.body;
              res.writeHead(201, {
                'content-type': 'application/json',
                'location': existing.location,
                'idempotent-replayed': 'true',
                'content-length': Buffer.byteLength(payload),
              });
              res.end(payload);
              return true;
            } else {
              sendProblem(res, 422, 'idempotency-key-reused', 'Idempotency-Key reused',
                'the key was already used with a different body');
              return true;
            }
          }
        }

        let inFlight = false;
        try {
          q.insertIdempotencyInFlight.run(key, fingerprint, new Date().toISOString());
          inFlight = true;
        } catch {
          // Concurrency: someone else inserted it
          existing = q.getIdempotency.get(key);
          if (existing) {
            if (existing.status === 0) {
              sendProblem(res, 409, 'idempotency-key-in-flight', 'Request in progress',
                'the first request with this key has not finished yet');
              return true;
            }
            if (existing.status === 201) {
              if (existing.fingerprint === fingerprint) {
                const payload = existing.body;
                res.writeHead(201, {
                  'content-type': 'application/json',
                  'location': existing.location,
                  'idempotent-replayed': 'true',
                  'content-length': Buffer.byteLength(payload),
                });
                res.end(payload);
                return true;
              } else {
                sendProblem(res, 422, 'idempotency-key-reused', 'Idempotency-Key reused',
                  'the key was already used with a different body');
                return true;
              }
            }
          }
        }

        let orderCommitted = false;
        try {
          // Step 4: Validate fields
          const validationErrors = [];
          if (typeof body !== 'object' || body === null || Array.isArray(body)) {
            validationErrors.push({ pointer: '', detail: 'must be a JSON object' });
            sendProblem(res, 400, 'validation', 'Invalid request',
              'request body is not an object', validationErrors);
            return true;
          }

          if (body.tableId === undefined || typeof body.tableId !== 'number' || !Number.isInteger(body.tableId) || body.tableId < 1 || body.tableId > 200) {
            validationErrors.push({ pointer: '/tableId', detail: 'must be an integer from 1 to 200' });
          }

          if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) {
            validationErrors.push({ pointer: '/items', detail: 'must be an array of 1 to 20 lines' });
          } else {
            for (let i = 0; i < body.items.length; i++) {
              const line = body.items[i];
              if (typeof line !== 'object' || line === null || Array.isArray(line)) {
                validationErrors.push({ pointer: `/items/${i}`, detail: 'must be an object' });
                continue;
              }
              if (line.menuItemId === undefined || typeof line.menuItemId !== 'number' || !Number.isInteger(line.menuItemId) || line.menuItemId <= 0) {
                validationErrors.push({ pointer: `/items/${i}/menuItemId`, detail: 'positive integer' });
              }
              if (line.qty === undefined || typeof line.qty !== 'number' || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > 20) {
                validationErrors.push({ pointer: `/items/${i}/qty`, detail: 'must be an integer from 1 to 20' });
              }
            }
          }

          if (validationErrors.length > 0) {
            sendProblem(res, 400, 'validation', 'Invalid request',
              `${validationErrors.length} field${validationErrors.length > 1 ? 's are' : ' is'} invalid`, validationErrors);
            return true;
          }

          // Step 5: Every menuItemId exists
          const unknownErrors = [];
          const itemPrices = new Map();
          for (let i = 0; i < body.items.length; i++) {
            const mId = body.items[i].menuItemId;
            if (!itemPrices.has(mId)) {
              const itemRow = q.getMenuItem.get(mId);
              if (!itemRow) {
                unknownErrors.push({ pointer: `/items/${i}/menuItemId`, detail: `menu item ${mId} does not exist` });
              } else {
                itemPrices.set(mId, itemRow.price_vnd);
              }
            }
          }

          if (unknownErrors.length > 0) {
            sendProblem(res, 422, 'unknown-menu-item', 'Unknown menu item',
              `${unknownErrors.length} line${unknownErrors.length > 1 ? 's name' : ' names'} an unknown menu item`, unknownErrors);
            return true;
          }

          // Step 6: Create order
          const createdAt = new Date().toISOString();
          let totalVnd = 0;
          const orderItems = body.items.map((line, idx) => {
            const unitPriceVnd = itemPrices.get(line.menuItemId);
            totalVnd += unitPriceVnd * line.qty;
            return {
              line: idx,
              menuItemId: line.menuItemId,
              qty: line.qty,
              unitPriceVnd,
            };
          });

          db.exec('BEGIN IMMEDIATE');
          try {
            const orderRes = q.insertOrder.run(body.tableId, totalVnd, createdAt);
            const orderId = Number(orderRes.lastInsertRowid);
            for (const it of orderItems) {
              q.insertOrderItem.run(orderId, it.line, it.menuItemId, it.qty, it.unitPriceVnd);
            }
            const orderObj = {
              id: orderId,
              tableId: body.tableId,
              items: orderItems.map((it) => ({
                menuItemId: it.menuItemId,
                qty: it.qty,
                unitPriceVnd: it.unitPriceVnd,
              })),
              totalVnd,
              createdAt,
            };
            const location = `/v1/orders/${orderId}`;
            const bodyStr = JSON.stringify(orderObj);
            q.updateIdempotencyDone.run(location, bodyStr, key);
            db.exec('COMMIT');
            orderCommitted = true;

            res.writeHead(201, {
              'content-type': 'application/json',
              'location': location,
              'content-length': Buffer.byteLength(bodyStr),
            });
            res.end(bodyStr);
            return true;
          } catch (e) {
            db.exec('ROLLBACK');
            throw e;
          }
        } finally {
          if (inFlight && !orderCommitted) {
            try { q.deleteIdempotency.run(key); } catch {}
          }
        }
      }

      // GET /v1/orders/{id}
      if (parts[0] === 'orders' && parts.length === 2 && req.method === 'GET') {
        const idStr = parts[1];
        const id = Number(idStr);
        if (!Number.isInteger(id) || id <= 0) {
          sendProblem(res, 404, 'not-found', 'Not found', `order ${idStr} not found`);
          return true;
        }
        const order = q.getOrder.get(id);
        if (!order) {
          sendProblem(res, 404, 'not-found', 'Not found', `order ${id} not found`);
          return true;
        }
        const items = q.getOrderItems.all(id).map((it) => ({
          menuItemId: it.menu_item_id,
          qty: it.qty,
          unitPriceVnd: it.unit_price_vnd,
        }));
        const payload = JSON.stringify({
          id: order.id,
          tableId: order.table_id,
          items,
          totalVnd: order.total_vnd,
          createdAt: order.created_at,
        });
        res.writeHead(200, {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        });
        res.end(payload);
        return true;
      }

      // GET /v1/orders
      if (parts[0] === 'orders' && parts.length === 1 && req.method === 'GET') {
        let tableId = null;
        if (url.searchParams.has('tableId')) {
          const tStr = url.searchParams.get('tableId');
          const tNum = Number(tStr);
          if (!Number.isInteger(tNum) || tNum < 1 || tNum > 200 || !/^\d+$/.test(tStr.trim())) {
            sendProblem(res, 400, 'validation', 'Invalid request',
              'query parameter tableId must be an integer from 1 to 200',
              [{ parameter: 'tableId', detail: 'must be an integer from 1 to 200' }]);
            return true;
          }
          tableId = tNum;
        }

        let limit = 20;
        if (url.searchParams.has('limit')) {
          const lStr = url.searchParams.get('limit');
          const lNum = Number(lStr);
          if (!Number.isInteger(lNum) || lNum < 1 || lNum > 100 || !/^\d+$/.test(lStr.trim())) {
            sendProblem(res, 400, 'validation', 'Invalid request',
              'query parameter limit must be an integer from 1 to 100',
              [{ parameter: 'limit', detail: 'must be an integer from 1 to 100' }]);
            return true;
          }
          limit = lNum;
        }

        let cursorId = null;
        if (url.searchParams.has('cursor')) {
          const cStr = url.searchParams.get('cursor');
          try {
            const decoded = Buffer.from(cStr, 'base64').toString('utf8');
            const parsed = JSON.parse(decoded);
            if (typeof parsed !== 'object' || parsed === null || typeof parsed.id !== 'number' || !Number.isInteger(parsed.id) || parsed.id <= 0) {
              throw new Error('invalid cursor');
            }
            cursorId = parsed.id;
          } catch {
            sendProblem(res, 400, 'validation', 'Invalid request',
              'cursor is invalid or unreadable',
              [{ parameter: 'cursor', detail: 'a nextCursor value returned by this endpoint' }]);
            return true;
          }
        }

        let rows;
        if (tableId !== null && cursorId !== null) {
          rows = q.listOrdersTableCursor.all(tableId, cursorId, limit + 1);
        } else if (tableId !== null) {
          rows = q.listOrdersTable.all(tableId, limit + 1);
        } else if (cursorId !== null) {
          rows = q.listOrdersCursor.all(cursorId, limit + 1);
        } else {
          rows = q.listOrdersAll.all(limit + 1);
        }

        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;

        const items = pageRows.map((r) => {
          const orderItems = q.getOrderItems.all(r.id).map((it) => ({
            menuItemId: it.menu_item_id,
            qty: it.qty,
            unitPriceVnd: it.unit_price_vnd,
          }));
          return {
            id: r.id,
            tableId: r.table_id,
            items: orderItems,
            totalVnd: r.total_vnd,
            createdAt: r.created_at,
          };
        });

        let nextCursor = null;
        if (hasMore && pageRows.length > 0) {
          const lastId = pageRows[pageRows.length - 1].id;
          nextCursor = Buffer.from(JSON.stringify({ id: lastId })).toString('base64');
        }

        const payload = JSON.stringify({ items, nextCursor });
        res.writeHead(200, {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        });
        res.end(payload);
        return true;
      }

      // Any other /v1 path or method is 404 not-found problem
      sendProblem(res, 404, 'not-found', 'Not found', `no such /v1 route: ${url.pathname}`);
      return true;
    } catch (err) {
      if (!res.headersSent) {
        sendProblem(res, 500, 'internal', 'Internal error', 'An unexpected error occurred.');
      }
      return true;
    }
  };
}
