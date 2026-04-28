use anchor_lang::prelude::*;

declare_id!("Guard111111111111111111111111111111111111111");

#[program]
pub mod proofmesh_guard {
    use super::*;

    pub fn issue_permit(ctx: Context<IssuePermit>, args: IssuePermitArgs) -> Result<()> {
        validate_amount_decision(args.decision, args.requested_amount_lamports, args.approved_amount_lamports)?;

        let permit = &mut ctx.accounts.permit;
        permit.intent_hash = args.intent_hash;
        permit.proof_root = args.proof_root;
        permit.decision = args.decision;
        permit.requested_amount_lamports = args.requested_amount_lamports;
        permit.approved_amount_lamports = args.approved_amount_lamports;
        permit.treasury = args.treasury;
        permit.recipient = args.recipient;
        permit.issuer = ctx.accounts.issuer.key();
        permit.expires_at = args.expires_at;
        permit.execution_status = ExecutionStatus::NotExecuted;
        permit.bump = ctx.bumps.permit;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(args: IssuePermitArgs)]
pub struct IssuePermit<'info> {
    #[account(
        init,
        payer = issuer,
        space = Permit::LEN,
        seeds = [b"permit", args.intent_hash.as_ref()],
        bump
    )]
    pub permit: Account<'info, Permit>,
    #[account(mut)]
    pub issuer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub struct IssuePermitArgs {
    pub intent_hash: [u8; 32],
    pub proof_root: [u8; 32],
    pub decision: GuardDecision,
    pub requested_amount_lamports: u64,
    pub approved_amount_lamports: u64,
    pub treasury: Pubkey,
    pub recipient: Pubkey,
    pub expires_at: i64,
}

#[account]
pub struct Permit {
    pub intent_hash: [u8; 32],
    pub proof_root: [u8; 32],
    pub decision: GuardDecision,
    pub requested_amount_lamports: u64,
    pub approved_amount_lamports: u64,
    pub treasury: Pubkey,
    pub recipient: Pubkey,
    pub issuer: Pubkey,
    pub expires_at: i64,
    pub execution_status: ExecutionStatus,
    pub bump: u8,
}

impl Permit {
    pub const LEN: usize = 8
        + 32
        + 32
        + GuardDecision::LEN
        + 8
        + 8
        + 32
        + 32
        + 32
        + 8
        + ExecutionStatus::LEN
        + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum GuardDecision {
    Release,
    Cap,
    Hold,
    Block,
}

impl GuardDecision {
    pub const LEN: usize = 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ExecutionStatus {
    NotExecuted,
    Executed,
}

impl ExecutionStatus {
    pub const LEN: usize = 1;
}

#[error_code]
pub enum GuardError {
    #[msg("BLOCK permits must approve zero lamports")]
    InvalidBlockAmount,
    #[msg("CAP permits must approve less than the requested amount")]
    InvalidCapAmount,
    #[msg("RELEASE permits must approve the requested amount")]
    InvalidReleaseAmount,
    #[msg("HOLD permits must approve zero lamports")]
    InvalidHoldAmount,
}

fn validate_amount_decision(
    decision: GuardDecision,
    requested_amount_lamports: u64,
    approved_amount_lamports: u64,
) -> Result<()> {
    match decision {
        GuardDecision::Block => require!(
            approved_amount_lamports == 0,
            GuardError::InvalidBlockAmount
        ),
        GuardDecision::Cap => require!(
            approved_amount_lamports < requested_amount_lamports,
            GuardError::InvalidCapAmount
        ),
        GuardDecision::Release => require!(
            approved_amount_lamports == requested_amount_lamports,
            GuardError::InvalidReleaseAmount
        ),
        GuardDecision::Hold => require!(
            approved_amount_lamports == 0,
            GuardError::InvalidHoldAmount
        ),
    }

    Ok(())
}
