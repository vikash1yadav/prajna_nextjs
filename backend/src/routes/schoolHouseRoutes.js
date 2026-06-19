import express from 'express';
import SchoolHouseController from '../controllers/schoolHouseController.js';

const router = express.Router();
const controller = new SchoolHouseController();

router.get('/', controller.getHouses);
router.get('/:id', controller.getHouses);
router.post('/', controller.saveHouse);
router.put('/:id', controller.saveHouse);
router.delete('/:id', controller.deleteHouse);

export default router;
