import sequelize from './database.js';
import { QueryTypes } from 'sequelize';

let activeSessionIdCache = null;

export async function getActiveSessionId() {
  if (activeSessionIdCache !== null) {
    return activeSessionIdCache;
  }
  try {
    const result = await sequelize.query('SELECT session_id FROM sch_settings LIMIT 1', {
      type: QueryTypes.SELECT
    });
    if (result && result.length > 0) {
      activeSessionIdCache = result[0].session_id;
      return activeSessionIdCache;
    }
  } catch (err) {
    console.error('Error fetching active session ID:', err.message);
  }
  return 21; // Fallback to 21
}

export async function resolveSessionId(sessionId) {
  const parsed = sessionId ? parseInt(sessionId) : null;
  if (!parsed || parsed === 1) {
    return await getActiveSessionId();
  }
  return parsed;
}

export function clearSessionCache() {
  activeSessionIdCache = null;
}
