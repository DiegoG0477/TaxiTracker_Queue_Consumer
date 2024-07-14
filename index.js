"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
var amqp = require("amqplib/callback_api");
var dotenv = require("dotenv");
dotenv.config();
var USERNAME = (_a = process.env.USERNAME) !== null && _a !== void 0 ? _a : "guest";
var PASSWORD = encodeURIComponent((_b = process.env.PASSWORD) !== null && _b !== void 0 ? _b : "password");
var HOSTNAME = (_c = process.env.HOSTNAME) !== null && _c !== void 0 ? _c : "localhost";
var PORT = parseInt((_d = process.env.PORT) !== null && _d !== void 0 ? _d : "5672", 10);
var RABBITMQ_QUEUE = (_e = process.env.RABBITMQ_QUEUE) !== null && _e !== void 0 ? _e : "Queue";
var API_HOST = (_f = process.env.API_URL) !== null && _f !== void 0 ? _f : "localhost";
function sendDatatoAPI(data, queue) {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, requestData, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiUrl = "";
                    switch (queue) {
                        case "driving":
                            apiUrl = "http://".concat(API_HOST, "/drivings");
                            break;
                        case "travel":
                            apiUrl = "http://".concat(API_HOST, "/travels");
                            break;
                        case "geolocation":
                            apiUrl = "http://".concat(API_HOST, "/geolocation");
                            break;
                        case "crash":
                            apiUrl = "http://".concat(API_HOST, "/crashes");
                            break;
                        default:
                            break;
                    }
                    requestData = {
                        body: JSON.stringify(data),
                    };
                    console.log(requestData.body);
                    return [4 /*yield*/, fetch(apiUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: requestData.body,
                        })];
                case 1:
                    response = _a.sent();
                    console.log('API DATA RESPONSE: ', response);
                    return [2 /*return*/];
            }
        });
    });
}
function connect() {
    return __awaiter(this, void 0, void 0, function () {
        var url_1;
        var _this = this;
        return __generator(this, function (_a) {
            try {
                url_1 = "amqp://".concat(USERNAME, ":").concat(PASSWORD, "@").concat(HOSTNAME, ":").concat(PORT);
                amqp.connect(url_1, function (err, conn) {
                    console.log("Connecting to RabbitMQ", url_1);
                    if (err)
                        throw new Error(err);
                    conn.createChannel(function (errChanel, channel) {
                        if (errChanel)
                            throw new Error(errChanel);
                        channel.assertQueue(RABBITMQ_QUEUE, { durable: true, arguments: { "x-queue-type": "quorum" } });
                        channel.consume(RABBITMQ_QUEUE, function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var parsedContent, queue;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!((data === null || data === void 0 ? void 0 : data.content) !== undefined)) return [3 /*break*/, 2];
                                        parsedContent = JSON.parse(data.content.toString());
                                        queue = parsedContent.event.split('.')[0];
                                        console.log("order:processed:", parsedContent);
                                        return [4 /*yield*/, sendDatatoAPI(parsedContent, queue)];
                                    case 1:
                                        _a.sent();
                                        channel.ack(data);
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                });
            }
            catch (err) {
                throw new Error(err);
            }
            return [2 /*return*/];
        });
    });
}
connect();
