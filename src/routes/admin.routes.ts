import { createAdmin, getAllAdmin, loginAdmin } from "#controllers/admin.controller.js"
import { authMiddleware } from "#middlewares/auth.middleware.js"
import {Router} from "express"

const adminRouter = Router()

adminRouter.post('/create', createAdmin)

adminRouter.post('/signin', loginAdmin)

adminRouter.get('/',authMiddleware, getAllAdmin)

export default adminRouter