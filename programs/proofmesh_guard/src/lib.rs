use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("5LUyS5ZN4F4qK8xQy2RnABcoKAFFo4VuApLGKzyF4xjk");

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

    pub fn execute_payout(ctx: Context<ExecutePayout>) -> Result<()> {
        let permit = &mut ctx.accounts.permit;
        let now = Clock::get()?.unix_timestamp;

        require!(
            matches!(permit.decision, GuardDecision::Release | GuardDecision::Cap),
            GuardError::PermitDecisionCannotExecute
        );
        require_keys_eq!(
            ctx.accounts.treasury.key(),
            permit.treasury,
            GuardError::TreasuryMismatch
        );
        require_keys_eq!(
            ctx.accounts.recipient.key(),
            permit.recipient,
            GuardError::RecipientMismatch
        );
        require!(permit.expires_at >= now, GuardError::PermitExpired);
        require!(
            permit.execution_status == ExecutionStatus::NotExecuted,
            GuardError::PermitAlreadyExecuted
        );

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.recipient.to_account_info(),
                },
            ),
            permit.approved_amount_lamports,
        )?;

        permit.execution_status = ExecutionStatus::Executed;

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

#[derive(Accounts)]
pub struct ExecutePayout<'info> {
    #[account(
        mut,
        seeds = [b"permit", permit.intent_hash.as_ref()],
        bump = permit.bump
    )]
    pub permit: Account<'info, Permit>,
    #[account(mut)]
    pub treasury: Signer<'info>,
    /// CHECK: The recipient is constrained by the permit and receives native SOL.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
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
    #[msg("Only RELEASE and CAP permits can execute")]
    PermitDecisionCannotExecute,
    #[msg("Treasury account does not match permit")]
    TreasuryMismatch,
    #[msg("Recipient account does not match permit")]
    RecipientMismatch,
    #[msg("Permit is expired")]
    PermitExpired,
    #[msg("Permit has already been executed")]
    PermitAlreadyExecuted,
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
