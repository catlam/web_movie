import express from "express";
import { createPayment, momoIpn, momoReturn } from "../Controllers/MomoController.js";
import { protect } from "../middlewares/Auth.js";

const router = express.Router();

// POST /api/membership
// router.post("/membership", createPayment);

// POST /api/momo/create
router.post("/create", protect, createPayment);

// POST /api/momo/ipn  <-- MoMo gọi về
router.post("/ipn", momoIpn);

router.get("/return", momoReturn); 

export default router;
