import { NextRequest, NextResponse } from "next/server";
import { parseSignedTransaction, isValidAddress } from "@/lib/monad-utils";
import type {
  VerifyRequest,
  VerifyResponse,
  PaymentPayload,
} from "@/lib/x402-protocol-types";
import { X402_VERSION, MONAD_SCHEME, MONAD_TESTNET, MONAD_MAINNET } from "@/lib/x402-protocol-types";

export const dynamic = "force-dynamic";

/**
 * POST /api/facilitator/verify
 * 
 * x402 Facilitator Verify Endpoint for Monad (per official spec):
 * - Receives payment header and payment requirements from protected API
 * - Verifies the EVM transaction structure and signature
 * - Checks amount and recipient WITHOUT submitting to blockchain
 * - Returns verification result (isValid/invalidReason)
 * 
 * This is fast and cheap - just validation, no blockchain submission
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[Facilitator Verify] POST /api/facilitator/verify`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  try {
    const body: VerifyRequest = await request.json();
    const { x402Version, paymentHeader, paymentRequirements } = body;

    console.log(`[Facilitator Verify] Request body:`, {
      x402Version,
      hasPaymentHeader: !!paymentHeader,
      headerLength: paymentHeader?.length,
      scheme: paymentRequirements.scheme,
      network: paymentRequirements.network,
      maxAmountRequired: paymentRequirements.maxAmountRequired,
      payTo: paymentRequirements.payTo,
    });

    // Validate x402 version
    if (x402Version !== X402_VERSION) {
      console.error(`[Facilitator Verify] ❌ Unsupported x402 version: ${x402Version}`);
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Unsupported x402 version: ${x402Version}`,
      };
      return NextResponse.json(response);
    }

    // Validate required fields
    if (!paymentHeader || !paymentRequirements) {
      console.error(`[Facilitator Verify] ❌ Missing required fields`);
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: "Missing paymentHeader or paymentRequirements",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate scheme
    if (paymentRequirements.scheme !== MONAD_SCHEME) {
      console.error(`[Facilitator Verify] ❌ Unsupported scheme: ${paymentRequirements.scheme}`);
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Unsupported scheme: ${paymentRequirements.scheme}`,
      };
      return NextResponse.json(response);
    }

    // Validate network is Monad-specific
    const network = paymentRequirements.network;
    const validMonadNetworks = [MONAD_TESTNET, MONAD_MAINNET];
    if (!network || !network.startsWith('monad-')) {
      console.error(`[Facilitator Verify] ❌ Invalid Monad network: ${network}`);
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Invalid Monad network: ${network}. Expected monad-testnet or monad-mainnet`,
      };
      return NextResponse.json(response);
    }
    
    console.log(`[Facilitator Verify] Network: ${network}`);
    console.log(`[Facilitator Verify] ✅ Monad network validated`);

    console.log(`\n🔍 [Facilitator Verify] Verifying payment payload...`);

    // Parse the payment header (base64 encoded PaymentPayload)
    console.log(`[Facilitator Verify] 📥 Raw paymentHeader (first 100 chars):`, paymentHeader.substring(0, 100) + '...');
    console.log(`[Facilitator Verify] 📥 Raw paymentHeader length:`, paymentHeader.length);
    
    let paymentPayloadJson: string;
    try {
      paymentPayloadJson = Buffer.from(paymentHeader, 'base64').toString('utf-8');
      console.log(`[Facilitator Verify] 📝 Decoded JSON (first 300 chars):`, paymentPayloadJson.substring(0, 300) + '...');
    } catch (decodeError) {
      console.error(`[Facilitator Verify] ❌ Failed to decode base64 header:`, decodeError);
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: "Invalid base64 encoding in X-PAYMENT header",
      };
      return NextResponse.json(response);
    }
    
    let paymentPayload: PaymentPayload;
    try {
      paymentPayload = JSON.parse(paymentPayloadJson);
      console.log(`[Facilitator Verify] ✅ Parsed JSON successfully`);
    } catch (parseError) {
      console.error(`[Facilitator Verify] ❌ Failed to parse JSON:`, parseError);
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: "Invalid JSON in payment payload",
      };
      return NextResponse.json(response);
    }
    
    console.log(`[Facilitator Verify] Parsed payment payload:`, {
      x402Version: paymentPayload.x402Version,
      scheme: paymentPayload.scheme,
      network: paymentPayload.network,
      hasPayload: !!paymentPayload.payload,
      payloadType: typeof paymentPayload.payload,
      payloadKeys: paymentPayload.payload ? Object.keys(paymentPayload.payload) : [],
    });

    // Validate payment payload matches requirements
    if (paymentPayload.scheme !== paymentRequirements.scheme) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Scheme mismatch: expected ${paymentRequirements.scheme}, got ${paymentPayload.scheme}`,
      };
      return NextResponse.json(response);
    }

    if (paymentPayload.network !== paymentRequirements.network) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Network mismatch: expected ${paymentRequirements.network}, got ${paymentPayload.network}`,
      };
      return NextResponse.json(response);
    }

    // For Monad/EVM scheme, the payload contains a signed transaction
    console.log(`\n🔍 [Facilitator Verify] Extracting signed transaction...`);
    console.log(`[Facilitator Verify] payload.signedTransaction exists:`, !!paymentPayload.payload.signedTransaction);
    
    const signedTransaction = paymentPayload.payload.signedTransaction;
    
    if (!signedTransaction) {
      console.error(`[Facilitator Verify] ❌ Missing signed transaction`);
      console.error(`[Facilitator Verify] Full payload object:`, JSON.stringify(paymentPayload.payload, null, 2));
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: "Invalid payload: missing signedTransaction",
      };
      return NextResponse.json(response);
    }

    console.log(`[Facilitator Verify] ✅ Signed transaction length: ${signedTransaction.length}`);
    console.log(`[Facilitator Verify] Signed transaction (first 50 chars):`, signedTransaction.substring(0, 50) + '...');
    
    // Parse and validate the signed transaction
    console.log(`\n🔍 [Facilitator Verify] Parsing EVM transaction...`);
    try {
      const tx = parseSignedTransaction(signedTransaction);
      
      console.log(`[Facilitator Verify] ✅ Transaction parsed successfully`);
      console.log(`[Facilitator Verify] From:`, tx.from);
      console.log(`[Facilitator Verify] To:`, tx.to);
      console.log(`[Facilitator Verify] Value:`, tx.value.toString());
      console.log(`[Facilitator Verify] ChainId:`, tx.chainId);
      
      // Validate recipient
      if (tx.to?.toLowerCase() !== paymentRequirements.payTo.toLowerCase()) {
        console.error(`[Facilitator Verify] ❌ Recipient mismatch`);
        console.error(`[Facilitator Verify] Expected:`, paymentRequirements.payTo);
        console.error(`[Facilitator Verify] Got:`, tx.to);
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Recipient mismatch: expected ${paymentRequirements.payTo}, got ${tx.to}`,
        };
        return NextResponse.json(response);
      }
      
      // Validate amount
      if (tx.value.toString() !== paymentRequirements.maxAmountRequired) {
        console.error(`[Facilitator Verify] ❌ Amount mismatch`);
        console.error(`[Facilitator Verify] Expected:`, paymentRequirements.maxAmountRequired);
        console.error(`[Facilitator Verify] Got:`, tx.value.toString());
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Amount mismatch: expected ${paymentRequirements.maxAmountRequired}, got ${tx.value.toString()}`,
        };
        return NextResponse.json(response);
      }
      
      // Validate sender address is valid
      if (!tx.from || !isValidAddress(tx.from)) {
        console.error(`[Facilitator Verify] ❌ Invalid sender address:`, tx.from);
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: "Invalid sender address",
        };
        return NextResponse.json(response);
      }
      
      console.log(`[Facilitator Verify] ✅ Transaction validation passed`);
    } catch (parseError: any) {
      console.error(`[Facilitator Verify] ❌ Failed to parse transaction:`, parseError);
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Failed to parse transaction: ${parseError.message}`,
      };
      return NextResponse.json(response);
    }

    console.log(`\n✅ [Facilitator Verify] Payment payload is valid!`);

    const duration = Date.now() - startTime;
    console.log(`[Facilitator Verify] ⏱️  Verification took ${duration}ms`);

    const response: VerifyResponse = {
      isValid: true,
      invalidReason: null,
    };

    console.log(`[Facilitator Verify] Response:`, response);
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('X-Verification-Time', duration.toString());
    return nextResponse;

  } catch (error: any) {
    console.error("[Facilitator Verify] Error verifying payment:", error);
    
    const response: VerifyResponse = {
      isValid: false,
      invalidReason: error.message || String(error),
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
