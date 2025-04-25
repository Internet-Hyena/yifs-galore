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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("@atproto/api");
var dotenv = require("dotenv");
var cron_1 = require("cron");
var process = require("process");
var fs = require("node:fs");
var path = require("node:path");
dotenv.config();
// Create a Bluesky Agent 
var agent = new api_1.BskyAgent({
    service: 'https://bsky.social',
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var files, randomFilePath, basename, fileUrl, imageBlob, uploadBlobRespose, _a, _b, blobRef, postResponse;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    files = fs
                        .readFileSync(process.env.IMAGE_LIST_NAME)
                        .toString('utf8')
                        .split('\n');
                    randomFilePath = files[files.length * Math.random() | 0];
                    basename = path.basename(randomFilePath);
                    fileUrl = process.env.IMAGE_URL_BASE + randomFilePath;
                    console.log("Fetching file... ".concat(fileUrl));
                    return [4 /*yield*/, fetch(fileUrl)];
                case 1: return [4 /*yield*/, (_c.sent()).blob()];
                case 2:
                    imageBlob = _c.sent();
                    console.log("Got ".concat(basename, " (size=").concat(imageBlob.size, ",type=").concat(imageBlob.type, ")"));
                    console.log("Logging in as ".concat(process.env.BLUESKY_USERNAME, "..."));
                    return [4 /*yield*/, agent.login({ identifier: process.env.BLUESKY_USERNAME, password: process.env.BLUESKY_PASSWORD })];
                case 3:
                    _c.sent();
                    console.log("Uploading image as blob...");
                    _b = (_a = agent).uploadBlob;
                    return [4 /*yield*/, imageBlob.bytes()];
                case 4: return [4 /*yield*/, _b.apply(_a, [_c.sent(), {
                            "encoding": "",
                            "headers": {
                                "Content-Type": imageBlob.type
                            }
                        }])];
                case 5:
                    uploadBlobRespose = _c.sent();
                    blobRef = uploadBlobRespose.data.blob;
                    console.log("Successfully uploaded blob (ref=".concat(blobRef.toJSON(), ")"));
                    return [4 /*yield*/, agent.post({
                            text: basename,
                            embed: {
                                $type: "app.bsky.embed.images",
                                images: [{
                                        alt: basename,
                                        image: blobRef
                                    }]
                            }
                        })];
                case 6:
                    postResponse = _c.sent();
                    console.log("Just posted! ".concat(postResponse.cid));
                    return [2 /*return*/];
            }
        });
    });
}
function tryMain() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                main();
            }
            catch (e) {
                console.error(e);
            }
            ;
            return [2 /*return*/];
        });
    });
}
tryMain();
// Run this on a cron job
var scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing
var scheduleExpression = '0 */3 * * *'; // Run once every three hours in prod
var job = new cron_1.CronJob(scheduleExpressionMinute, tryMain); // change to scheduleExpressionMinute for testing
job.start();
function getFileUrls() {
}
