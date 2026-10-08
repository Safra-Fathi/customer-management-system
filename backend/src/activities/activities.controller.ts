import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { ActivitiesService } from './activities.service.js';

@Controller('customers/:customerId/activity')
@UseGuards(AuthGuard)
export class ActivitiesController {
    constructor(
        private readonly activitiesService: ActivitiesService,
    ) { }

    @Get()
    findByCustomer(
        @Param('customerId') customerId: string,
    ) {
        return this.activitiesService.findByCustomer(customerId);
    }
}