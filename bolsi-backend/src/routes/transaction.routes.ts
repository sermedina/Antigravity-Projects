import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator';
import multer from "multer";
import fs from "fs";

const router = Router();
const transactionController = new TransactionController();
const uploadPath = process.env.IMAGES_UPLOAD_PATH || "/data/images";

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}


router.use(authenticateJWT); // Protect all transaction routes

const storage = multer.diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => {
        const ext = file.originalname.split(".").pop();
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
        const timestamp = Date.now();

        // Sanitizar datos (evitar espacios, acentos o caracteres raros en nombres)
        const safeFullName = (req.body.full_name || "noname").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        const safeCedula = (req.body.cedula || "nocedula").replace(/[^a-zA-Z0-9]/g, "");

        const newFileName = `${formattedDate}_${safeFullName}_CI${safeCedula}_${timestamp}.${ext}`;
        cb(null, newFileName);
    },
});
const upload = multer({ storage });

router.post('/', upload.single('payment_receipt_image'), validate(createTransactionSchema), transactionController.create);

router.get('/', transactionController.getAll);
router.get('/admin', authorizeRoles('SYSTEM_ADMIN'), transactionController.getAdminTransactions);
router.get('/:id', transactionController.getById);
router.put('/:id', upload.single('payment_receipt_image'), validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.delete);

export default router;
