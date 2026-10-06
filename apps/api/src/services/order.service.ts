import { query } from '../db/index.js';
import type { Order } from '@ig-nil/shared';

export async function createOrder(
  userId: string,
  athleteId: string,
  side: 'buy' | 'sell',
  quantity: number,
  pricePerUnit: number,
): Promise<Order> {
  const result = await query(
    `
    INSERT INTO orders (
      user_id,
      athlete_id,
      side,
      quantity,
      price_per_unit,
      status
    ) VALUES ($1, $2, $3, $4, $5, 'pending')
    RETURNING
      id,
      user_id,
      athlete_id,
      side,
      quantity,
      price_per_unit,
      status,
      filled_quantity,
      executed_price,
      created_at,
      updated_at
    `,
    [userId, athleteId, side, quantity, pricePerUnit],
  );

  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    athleteId: row.athlete_id,
    side: row.side,
    quantity: row.quantity,
    pricePerUnit: Number(row.price_per_unit),
    status: row.status,
    filledQuantity: row.filled_quantity,
    executedPrice: row.executed_price ? Number(row.executed_price) : 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function fillOrder(
  orderId: string,
  filledQuantity: number,
  executedPrice: number,
) {
  const result = await query(
    `
    UPDATE orders
    SET
      filled_quantity = $2,
      executed_price = $3,
      status = CASE
        WHEN $2 = quantity THEN 'filled'
        WHEN $2 > 0 THEN 'partial'
        ELSE 'pending'
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [orderId, filledQuantity, executedPrice],
  );

  return result.rows[0];
}

export async function getUserOrders(userId: string, limit = 50, offset = 0) {
  const result = await query(
    `
    SELECT
      id,
      user_id,
      athlete_id,
      side,
      quantity,
      price_per_unit,
      status,
      filled_quantity,
      executed_price,
      created_at,
      updated_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset],
  );

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    athleteId: row.athlete_id,
    side: row.side,
    quantity: row.quantity,
    pricePerUnit: Number(row.price_per_unit),
    status: row.status,
    filledQuantity: row.filled_quantity,
    executedPrice: row.executed_price ? Number(row.executed_price) : 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}
