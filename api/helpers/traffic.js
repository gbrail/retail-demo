'use strict';

function getClientIp(req) {
  return req.connection.remoteAddress;
}
module.exports.clientIp = getClientIp;
