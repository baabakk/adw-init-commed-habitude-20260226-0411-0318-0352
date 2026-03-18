"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByChannelIdentifier = findUserByChannelIdentifier;
exports.findUserById = findUserById;
exports.updateVerificationCode = updateVerificationCode;
exports.verifyUser = verifyUser;
exports.checkVerificationCode = checkVerificationCode;
const database_1 = require("../database");
async function createUser(data) {
    const result = await (0, database_1.query)(`INSERT INTO users (messaging_channel, channel_identifier, timezone, verification_code, verification_code_expires_at, is_verified)
     VALUES ($1, $2, $3, $4, $5, false)
     RETURNING *`, [
        data.messaging_channel,
        data.channel_identifier,
        data.timezone,
        data.verification_code,
        data.verification_code_expires_at,
    ]);
    return result.rows[0];
}
async function findUserByChannelIdentifier(channel_identifier) {
    const result = await (0, database_1.query)('SELECT * FROM users WHERE channel_identifier = $1', [channel_identifier]);
    return result.rows[0] || null;
}
async function findUserById(id) {
    const result = await (0, database_1.query)('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
}
async function updateVerificationCode(userId, code, expiresAt) {
    await (0, database_1.query)('UPDATE users SET verification_code = $1, verification_code_expires_at = $2 WHERE id = $3', [code, expiresAt, userId]);
}
async function verifyUser(userId) {
    await (0, database_1.query)('UPDATE users SET is_verified = true, verification_code = NULL, verification_code_expires_at = NULL WHERE id = $1', [userId]);
}
async function checkVerificationCode(userId, code) {
    const result = await (0, database_1.query)(`SELECT * FROM users 
     WHERE id = $1 
     AND verification_code = $2 
     AND verification_code_expires_at > NOW()`, [userId, code]);
    return result.rows.length > 0;
}
exports.default = {
    createUser,
    findUserByChannelIdentifier,
    findUserById,
    updateVerificationCode,
    verifyUser,
    checkVerificationCode,
};
//# sourceMappingURL=user.js.map