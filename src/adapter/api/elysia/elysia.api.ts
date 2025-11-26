import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { Controller } from "./controller.elysia";

import { opentelemetry } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";

import openapi from "@elysiajs/openapi";
import Elysia from "elysia";

export class ElysiaApiAdapter {
    private controller: Controller;
    public app: Elysia;

    constructor(
        computerService: ComputerService,
        deviceService: DeviceService,
        medicalDeviceService: MedicalDeviceService
    ) {
        this.controller = new Controller(
            computerService,
            deviceService,
            medicalDeviceService
        );


        const axiomToken = Bun.env.AXIOM_TOKEN;
        const axiomDataset = Bun.env.AXIOM_DATASET;

        const enableAxiom =
            typeof axiomToken === "string" &&
            axiomToken.length > 0 &&
            typeof axiomDataset === "string" &&
            axiomDataset.length > 0;

        this.app = new Elysia();


        if (enableAxiom) {
            console.log("✔ Axiom habilitado: enviando métricas");

            this.app.use(
                opentelemetry({
                    spanProcessors: [
                        new BatchSpanProcessor(
                            new OTLPTraceExporter({
                                url: "https://api.axiom.co/v1/traces",
                                headers: {
                                    Authorization: `Bearer ${axiomToken}`,
                                    "X-Axiom-Dataset": axiomDataset
                                }
                            })
                        )
                    ]
                })
            );
        } else {
            console.warn("⚠️ Axiom deshabilitado: faltan AXIOM_TOKEN y/o AXIOM_DATASET");
        }

 
        this.app.use(openapi({}));
        this.app.use(this.controller.routes());
    }

    async run() {
        this.app.listen(3000);
        console.log("El servidor está corriendo en el puerto 3000");
    }
}
