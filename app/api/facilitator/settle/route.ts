import { NextRequest, NextResponse } from "next/server";
import { submitTransaction, waitForTransaction } from "@/lib/monad-utils";
import type {
  SettleRequest,
  SettleResponse,
  PaymentPayload,
} from "@/lib/x402-protocol-types";
import { X402_VERSION, MONAD_SCHEME, MONAD_TESTNET, MONAD_MAINNET } from "@/lib/x402-protocol-types";

export const dynamic = "force-dynamic";

/**
 * POST /api/facilitator/settle
 * 
 * x402 Facilitator Settle Endpoint for Monad (per official spec):
 * - Receives payment header and payment requirements from protected API AFTER verification
 * - Submits EVM transaction to Monad blockchain
 * - Waits for confirmation
 * - Returns settlement result (success, txHash, networkId)
 * 
 * This is slow and expensive - actual blockchain submission
 * Only call this AFTER the work/resource has been verified
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[Facilitator Settle] POST /api/facilitator/settle`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  try {
    const body: SettleRequest = await request.json();
    const { x402Version, paymentHeader, paymentRequirements } = body;

    console.log(`[Facilitator Settle] Request body:`, {
      x402Version,
      hasPaymentHeader: !!paymentHeader,
      headerLength: paymentHeader?.length,
      scheme: paymentRequirements.scheme,
      network: paymentRequirements.network,
    });

    // Validate x402 version
    if (x402Version !== X402_VERSION) {
      console.error(`[Facilitator Settle] ❌ Unsupported x402 version: ${x402Version}`);
      const response: SettleResponse = {
        success: false,
        error: `Unsupported x402 version: ${x402Version}`,
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(response);
    }

    // Validate required fields
    if (!paymentHeader || !paymentRequirements) {
      console.error(`[Facilitator Settle] ❌ Missing required fields`);
      const response: SettleResponse = {
        success: false,
        error: "Missing paymentHeader or paymentRequirements",
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate scheme
    if (paymentRequirements.scheme !== MONAD_SCHEME) {
      console.error(`[Facilitator Settle] ❌ Unsupported scheme: ${paymentRequirements.scheme}`);
      const response: SettleResponse = {
        success: false,
        error: `Unsupported scheme: ${paymentRequirements.scheme}`,
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(response);
    }

    const network = paymentRequirements.network;
    if (!network) {
      console.error(`[Facilitator Settle] ❌ Network not specified in payment requirements`);
      const response: SettleResponse = {
        success: false,
        error: "Network not specified in payment requirements",
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Extract network type (testnet/mainnet)
    const networkType = network === MONAD_MAINNET ? 'mainnet' : 'testnet';
    console.log(`[Facilitator Settle] Network: ${network} (${networkType})`);

    // Parse the payment header (base64 encoded PaymentPayload)
    console.log(`[Facilitator Settle] 📥 Parsing payment payload...`);
    console.log(`[Facilitator Settle] Raw paymentHeader (first 100 chars):`, paymentHeader.substring(0, 100) + '...');
    
    let paymentPayloadJson: string;
    try {
      paymentPayloadJson = Buffer.from(paymentHeader, 'base64').toString('utf-8');
      console.log(`[Facilitator Settle] 📝 Decoded JSON (first 300 chars):`, paymentPayloadJson.substring(0, 300) + '...');
    } catch (decodeError) {
      console.error(`[Facilitator Settle] ❌ Failed to decode base64:`, decodeError);
      const response: SettleResponse = {
        success: false,
        error: "Invalid base64 encoding",
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    let paymentPayload: PaymentPayload;
    try {
      paymentPayload = JSON.parse(paymentPayloadJson);
      console.log(`[Facilitator Settle] ✅ Parsed JSON successfully`);
    } catch (parseError) {
      console.error(`[Facilitator Settle] ❌ Failed to parse JSON:`, parseError);
      const response: SettleResponse = {
        success: false,
        error: "Invalid JSON",
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    console.log(`[Facilitator Settle] ✅ Parsed payment payload`);
    console.log(`[Facilitator Settle] Scheme: ${paymentPayload.scheme}`);
    console.log(`[Facilitator Settle] Network: ${paymentPayload.network}`);
    console.log(`[Facilitator Settle] Payload keys:`, Object.keys(paymentPayload.payload));

    // Extract signed transaction from payload
    console.log(`\n🔍 [Facilitator Settle] Extracting signed transaction...`);
    const signedTransaction = paymentPayload.payload.signedTransaction;
    
    if (!signedTransaction) {
      console.error(`[Facilitator Settle] ❌ Missing signed transaction`);
      const response: SettleResponse = {
        success: false,
        error: "Invalid payload: missing signedTransaction",
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(response);
    }

    console.log(`[Facilitator Settle] ✅ Signed transaction length: ${signedTransaction.length}`);
    console.log(`[Facilitator Settle] Signed transaction (first 50):`, signedTransaction.substring(0, 50) + '...');
    
    console.log(`\n📤 [Facilitator Settle] Submitting signed transaction to Monad blockchain...`);
    
    let txResponse;
    try {
      txResponse = await submitTransaction(signedTransaction, networkType as 'testnet' | 'mainnet');
      console.log(`[Facilitator Settle] ✅ Transaction submitted!`);
      console.log(`[Facilitator Settle] Transaction hash: ${txResponse.hash}`);
    } catch (submitError: any) {
      console.error(`[Facilitator Settle] ❌ Submission failed:`, submitError);
      const settleResponse: SettleResponse = {
        success: false,
        error: submitError.message || String(submitError),
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(settleResponse, { status: 500 });
    }

    console.log(`\n⏳ [Facilitator Settle] Waiting for blockchain confirmation...`);
    
    // Wait for transaction to be confirmed (per x402 spec)
    const receipt = await waitForTransaction(txResponse.hash, networkType as 'testnet' | 'mainnet', 1);

    if (!receipt) {
      console.error(`[Facilitator Settle] ❌ Transaction receipt not found`);
      const settleResponse: SettleResponse = {
        success: false,
        error: "Transaction receipt not found",
        txHash: txResponse.hash,
        networkId: network,
      };
      return NextResponse.json(settleResponse);
    }

    console.log(`[Facilitator Settle] ✅ Transaction confirmed!`);
    console.log(`[Facilitator Settle] Block number:`, receipt.blockNumber);
    console.log(`[Facilitator Settle] Status:`, receipt.status === 1 ? 'Success' : 'Failed');

    if (receipt.status !== 1) {
      console.error(`[Facilitator Settle] ❌ Transaction FAILED on blockchain`);
      const settleResponse: SettleResponse = {
        success: false,
        error: "Transaction failed on blockchain",
        txHash: txResponse.hash,
        networkId: network,
      };
      return NextResponse.json(settleResponse);
    }

    console.log(`\n✅ [Facilitator Settle] Payment settled successfully!`);
    console.log(`[Facilitator Settle] Transaction hash: ${txResponse.hash}`);

    const duration = Date.now() - startTime;
    console.log(`[Facilitator Settle] ⏱️  Settlement took ${duration}ms`);

    const settleResponse: SettleResponse = {
      success: true,
      error: null,
      txHash: txResponse.hash,
      networkId: network,
    };

    console.log(`[Facilitator Settle] Response:`, settleResponse);
    const nextResponse = NextResponse.json(settleResponse);
    nextResponse.headers.set('X-Settlement-Time', duration.toString());
    return nextResponse;

  } catch (error: any) {
    console.error(`\n❌ [Facilitator Settle] ERROR during settlement`);
    console.error(`[Facilitator Settle] Error type:`, error.constructor.name);
    console.error(`[Facilitator Settle] Error message:`, error.message);
    console.error(`[Facilitator Settle] Full error:`, error);
    
    // Check if it's a duplicate transaction error
    if (error.message?.includes("SEQUENCE_NUMBER_TOO_OLD") || 
        error.message?.includes("INVALID_SEQ_NUMBER") ||
        error.message?.includes("already submitted")) {
      const response: SettleResponse = {
        success: false,
        error: "Transaction already used",
        txHash: null,
        networkId: null,
      };
      return NextResponse.json(response, { status: 409 });
    }

    const response: SettleResponse = {
      success: false,
      error: error.message || String(error),
      txHash: null,
      networkId: null,
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
