import { Module } from "@nestjs/common";
import { OverviewController } from "./overview/overview.controller";
import { OverviewService } from "./overview/overview.service";
import { SlowmovingController } from "./slowmoving/slowmoving.controller";
import { SlowmovingService } from "./slowmoving/slowmoving.service";
import { PrismaService } from "./common/prisma.service";
import { AppLogger } from "./common/app.logger";

@Module({
  controllers: [OverviewController, SlowmovingController],
  providers: [OverviewService, SlowmovingService, PrismaService, AppLogger],
})
export class AppModule {}
