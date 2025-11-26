import { ElysiaApiAdapter } from "./adapter/api/elysia";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";


const deviceRepository = new InMemoryDeviceRepository();
const photoRepository = new FileSystemPhotoRepository();


const baseApiUrl = process.env.WEBSITE_HOSTNAME
    ? `https://${process.env.WEBSITE_HOSTNAME}/api`
    : "http://localhost:3000/api";


const computerService = new ComputerService(
    deviceRepository,
    photoRepository,
    new URL(baseApiUrl)
);

const deviceService = new DeviceService(deviceRepository);

const medicalDeviceService = new MedicalDeviceService(
    deviceRepository,
    photoRepository
);

const app = new ElysiaApiAdapter(
    computerService,
    deviceService,
    medicalDeviceService
);


const PORT = process.env.PORT ? Number(process.env.PORT) : 443;

app.app.listen({
    port: PORT,
    hostname: "0.0.0.0"
});

console.log(`🔥 API running on port ${PORT}`);
console.log(`📡 Base API URL: ${baseApiUrl}`);
