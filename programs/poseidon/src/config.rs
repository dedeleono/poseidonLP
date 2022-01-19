use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

// Data Logic
pub fn handler(
  ctx: Context<Initialize>,
  psdn_bump: u8,
  usdc_bump: u8,
  trtn_bump: u8,
  shell_bump: u8,
) -> ProgramResult {
  let config = &mut ctx.accounts.config;
  config.authority = ctx.accounts.authority.key();
  config.psdn_bump = psdn_bump;
  config.usdc_bump = usdc_bump;
  config.trtn_bump = trtn_bump;
  config.shell_bump = shell_bump;
  config.usdc_amount = 0;
  config.trtn_amount = 0;
  Ok(())
}

// Data Validator
#[derive(Accounts)]
#[instruction(
  psdn_bump: u8,
  usdc_bump: u8,
  trtn_bump: u8,
  shell_bump: u8,
)]
pub struct Initialize<'info> {
  #[account(init, seeds = [b"psdn_account".as_ref()], bump = psdn_bump, payer = authority, space = Config::LEN)]
  pub config: Box<Account<'info, Config>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(init, seeds = [config.key().as_ref(), b"psdn_usdc_account".as_ref()], bump = usdc_bump, token::mint = usdc_mint, token::authority = usdc_account, payer = authority)]
  pub usdc_account: Box<Account<'info, TokenAccount>>,
  #[account(init, seeds = [config.key().as_ref(), b"psdn_trtn_account".as_ref()], bump = trtn_bump, token::mint = trtn_mint, token::authority = trtn_account, payer = authority)]
  pub trtn_account: Box<Account<'info, TokenAccount>>,
  #[account(init, seeds = [config.key().as_ref(), b"psdn_shell_account".as_ref()], bump = shell_bump, token::mint = shell_mint, token::authority = shell_account, payer = authority)]
  pub shell_account: Box<Account<'info, TokenAccount>>,
  pub usdc_mint: Box<Account<'info, Mint>>,
  pub trtn_mint: Box<Account<'info, Mint>>,
  pub shell_mint: Box<Account<'info, Mint>>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub rent: Sysvar<'info, Rent>,
}

// Data Structure
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBKEY_LENGTH: usize = 32;
const BUMP_LENGTH: usize = 8;
const COIN_LENGTH: usize = 8;

#[account]
pub struct Config {
  pub authority: Pubkey,
  pub psdn_bump: u8,
  pub usdc_bump: u8,
  pub trtn_bump: u8,
  pub shell_bump: u8,
  pub usdc_amount: u64,
  pub trtn_amount: u64,
}

impl Config {
  const LEN: usize = DISCRIMINATOR_LENGTH
    + PUBKEY_LENGTH
    + BUMP_LENGTH
    + BUMP_LENGTH
    + BUMP_LENGTH
    + BUMP_LENGTH
    + COIN_LENGTH
    + COIN_LENGTH;
}
