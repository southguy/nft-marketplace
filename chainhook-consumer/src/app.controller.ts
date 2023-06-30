import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiKeyAuthGuard } from './auth/guard/apikey-auth.guard';
import { Chainhook } from './chainhook/Chainhook';
import { ChainhookResponse } from './chainhook/ChainhookResponse';
import { Event } from './chainhook/Event';
import { cvToValue, deserializeCV } from "@stacks/transactions";


// @UseGuards(ApiKeyAuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Post('chainhook')
  chainhook(@Body() body: any): void {
    const chainhook = body as ChainhookResponse;

    const printEvents: Event[] = [];

    const transactions = chainhook.apply.map(apply => apply.transactions).reduce(function(a, b){ return a.concat(b); }, []);;

    for (const transaction of transactions) {
        if (transaction.metadata.success) {
          //
          // check the events of the metadata

          const transactionPrintEvents = (transaction.metadata.receipt.events || [])
            .filter(event => event.type === 'SmartContractEvent' && event.data.topic == "print");

          printEvents.push(...transactionPrintEvents);
        }
    }

    for (const printEvent of printEvents) {
      const hexData = printEvent.data.raw_value.replace('0x', '');
      const printPayloadCV = deserializeCV(Buffer.from(hexData, "hex"));
      const printPayload = cvToValue(printPayloadCV);
      console.log(printPayload);
    }

  }
}
