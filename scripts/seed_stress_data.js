"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = __importStar(require("dotenv"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
dotenv.config({ path: path_1.default.resolve(process.cwd(), '.env.local') });
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function seedStressData() {
    return __awaiter(this, void 0, void 0, function () {
        var scenariosPath, scenarios, vendorMap, vendors, vErr, ekko, ekpo, mseg, ai_examples, getVendorId, _loop_1, _i, scenarios_1, s, ekkoErr, count, ekpoErr, msegErr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('--- SEEDING STRESS TEST DATA (20 SCENARIOS) ---');
                    if (!supabaseKey) {
                        console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is MISSING!');
                        process.exit(1);
                    }
                    console.log('Service Role Key Loaded:', supabaseKey.slice(0, 5) + '...');
                    scenariosPath = path_1.default.resolve(process.cwd(), 'testing/stress_test/scenarios.json');
                    scenarios = JSON.parse(fs_1.default.readFileSync(scenariosPath, 'utf8'));
                    // 1. Vendors
                    console.log('1. Seeding Vendors...');
                    vendorMap = new Map();
                    scenarios.forEach(function (s) {
                        if (!vendorMap.has(s.vendor)) {
                            var email = 'ar@techgapsolutions.com';
                            if (s.vendor.includes('(EUR)'))
                                email = 'eu@techgap.com';
                            if (s.vendor.includes('LLC'))
                                email = 'llc@techgap.com';
                            vendorMap.set(s.vendor, {
                                vendor_id: '1000' + (50 + vendorMap.size), // 100050, 100051...
                                name: s.vendor,
                                email: email,
                                country: s.vendor.includes('(EUR)') ? 'DE' : 'US'
                            });
                        }
                    });
                    vendors = Array.from(vendorMap.values());
                    return [4 /*yield*/, supabase.from('lfa1').upsert(vendors)];
                case 1:
                    vErr = (_a.sent()).error;
                    if (vErr)
                        console.error('Error seeding vendors:', vErr);
                    else
                        console.log("\u2714 ".concat(vendors.length, " Vendors seeded."));
                    // 2. POs, Items, GRs
                    console.log('2. Seeding POs, Items, and GRs...');
                    ekko = [];
                    ekpo = [];
                    mseg = [];
                    ai_examples = [];
                    getVendorId = function (name) { var _a; return ((_a = vendorMap.get(name)) === null || _a === void 0 ? void 0 : _a.vendor_id) || '100050'; };
                    _loop_1 = function (s) {
                        if (!s.po_data)
                            return "continue";
                        // Header
                        ekko.push({
                            po_number: s.po_data.number,
                            vendor_id: getVendorId(s.vendor), // Should match Invoice Vendor mostly, or intentional mismatch?
                            // Note: In S8 Fuzzy, Invoice says "LLC", but PO matches correct vendor? 
                            // Usually PO is raised to the CORRECT vendor. Invoice might have Typo.
                            // If S8 is Fuzzy Match, the PO should exist for the "Real" vendor usually. 
                            // But for simplicity, let's assume PO matches the Scenario "Vendor" string unless specified.
                            // Wait, S8 Invoice Vendor is "TechGap LLC". PO should be "TechGap Solutions" logic wise if it's a "Match"?
                            // Or maybe LLM figures it out. Let's ensure PO exists for the Vendor defined in data.
                            company_code: '1000',
                            currency: s.po_data.currency,
                            purchasing_group: '001'
                        });
                        // Items
                        ekpo.push({
                            po_number: s.po_data.number,
                            line_item: s.po_data.item,
                            material: 'MAT-' + s.id,
                            description: s.line_item.desc,
                            ordered_qty: s.po_data.qty,
                            unit_price: s.po_data.price,
                            net_price: s.po_data.price
                        });
                        // Extra PO Lines
                        if (s.extra_po_lines) {
                            s.extra_po_lines.forEach(function (l) {
                                ekpo.push({
                                    po_number: s.po_data.number,
                                    line_item: l.item,
                                    material: 'MAT-' + s.id + '-EXTRA',
                                    description: 'Extra Line',
                                    ordered_qty: l.qty,
                                    unit_price: l.price,
                                    net_price: l.price
                                });
                            });
                        }
                        // GRs
                        if (s.gr_data) {
                            mseg.push({
                                po_number: s.po_data.number,
                                po_line_item: s.po_data.item,
                                received_qty: s.gr_data.received_qty,
                                movement_type: '101',
                                movement_date: new Date().toISOString()
                            });
                        }
                        if (s.extra_gr_data) {
                            s.extra_gr_data.forEach(function (g) {
                                mseg.push({
                                    po_number: s.po_data.number,
                                    po_line_item: g.item,
                                    received_qty: g.received_qty,
                                    movement_type: '101',
                                    movement_date: new Date().toISOString()
                                });
                            });
                        }
                        // AI Seeding
                        if (s.ai_seed) {
                            ai_examples.push({
                                vendor_name: s.vendor, // Or extracted name
                                field: s.ai_seed.field,
                                original_value: s.ai_seed.original, // e.g. 10.00
                                corrected_value: s.ai_seed.new, // e.g. 10.50
                                reason: s.ai_seed.reason,
                                action: 'APPROVED_VARIANCE', // valid enum?
                                created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
                            });
                        }
                    };
                    for (_i = 0, scenarios_1 = scenarios; _i < scenarios_1.length; _i++) {
                        s = scenarios_1[_i];
                        _loop_1(s);
                    }
                    if (!ekko.length) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase.from('ekko').upsert(ekko)];
                case 2:
                    ekkoErr = (_a.sent()).error;
                    if (ekkoErr)
                        console.error('Error upserting ekko:', ekkoErr);
                    return [4 /*yield*/, supabase.from('ekko').select('*', { count: 'exact', head: true })];
                case 3:
                    count = (_a.sent()).count;
                    console.log('Total EKKO Count after upsert:', count);
                    _a.label = 4;
                case 4:
                    if (!ekpo.length) return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase.from('ekpo').upsert(ekpo, { onConflict: 'po_number,line_item' })];
                case 5:
                    ekpoErr = (_a.sent()).error;
                    if (ekpoErr)
                        console.error('Error upserting ekpo:', ekpoErr);
                    _a.label = 6;
                case 6:
                    if (!mseg.length) return [3 /*break*/, 8];
                    return [4 /*yield*/, supabase.from('mseg').upsert(mseg)];
                case 7:
                    msegErr = (_a.sent()).error;
                    if (msegErr)
                        console.error('Error upserting mseg:', msegErr);
                    _a.label = 8;
                case 8:
                    if (!ai_examples.length) return [3 /*break*/, 10];
                    console.log('Seeding AI Examples...');
                    return [4 /*yield*/, supabase.from('ai_learning_examples').upsert(ai_examples)];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    console.log("\u2714 Seeded: ".concat(ekko.length, " POs, ").concat(ekpo.length, " Lines, ").concat(mseg.length, " GRs."));
                    console.log('--- DATA SEEDING COMPLETE ---\n');
                    return [2 /*return*/];
            }
        });
    });
}
seedStressData().catch(console.error);
