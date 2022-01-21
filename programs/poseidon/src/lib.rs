use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use std::cmp;

declare_id!("H2Z5eh9ddxcdLkEzpmzcVMKB5gD7H1A8EZ4B3dqbVSZN");

#[program]
pub mod poseidon {
    use super::*;

    pub fn initialize(
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
        config.shell_amount = 0;
        config.usdc_amount = 0;
        config.trtn_amount = 0;
        config.pool_constant = 0;
        config.pool_init = false;
        Ok(())
    }

    pub fn update_config(ctx: Context<UpdateConfig>) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        config.pool_constant = (96000000000000000000.0 / 1e6) as u64;
        Ok(())
    }

    pub fn swap_to_triton(ctx: Context<SwapToTriton>, usdc_to_swap: u64) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        let pool_constant = config.usdc_amount * config.trtn_amount;
        let new_usdc_amount = config.usdc_amount + usdc_to_swap;
        let trtn_to_send = (new_usdc_amount as f64 / pool_constant as f64 * 0.99) as u64;

        config.usdc_amount = new_usdc_amount;
        config.trtn_amount = config.trtn_amount - trtn_to_send;
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.auth_usdc_account.to_account_info(),
                    to: ctx.accounts.usdc_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            usdc_to_swap,
        )?;
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.trtn_account.to_account_info(),
                    to: ctx.accounts.auth_trtn_account.to_account_info(),
                    authority: ctx.accounts.trtn_account.to_account_info(),
                },
                &[&[
                    config.key().as_ref(),
                    b"psdn_trtn_account".as_ref(),
                    &[config.trtn_bump],
                ]],
            ),
            trtn_to_send,
        )?;
        Ok(())
    }

    pub fn swap_to_usdc(ctx: Context<SwapToUsdc>, trtn_to_swap: u64) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        let pool_constant = config.usdc_amount * config.trtn_amount;
        let new_trtn_amount = config.trtn_amount + trtn_to_swap;
        let usdc_to_send = (new_trtn_amount as f64 / pool_constant as f64 * 1e6 * 0.99) as u64;
        config.trtn_amount = new_trtn_amount;
        config.usdc_amount = config.usdc_amount - usdc_to_send;
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.auth_trtn_account.to_account_info(),
                    to: ctx.accounts.trtn_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            trtn_to_swap,
        )?;
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.usdc_account.to_account_info(),
                    to: ctx.accounts.auth_usdc_account.to_account_info(),
                    authority: ctx.accounts.usdc_account.to_account_info(),
                },
                &[&[
                    config.key().as_ref(),
                    b"psdn_usdc_account".as_ref(),
                    &[config.usdc_bump],
                ]],
            ),
            usdc_to_send,
        )?;
        Ok(())
    }

    pub fn provide_liquidity(
        ctx: Context<ProvideLiquidity>,
        trtn: u64,
        usdc: u64,
    ) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        // make sure there isn't a massive ratio imbalance
        if config.pool_init {
            let ratio = (((usdc as f64) / trtn as f64)
                - (config.usdc_amount as f64 / config.trtn_amount as f64))
                .abs();
            if ratio > 0.025 {
                return Err(ErrorCode::IncorrectRatio.into());
            }
        }

        config.trtn_amount = config.trtn_amount + trtn;
        config.usdc_amount = config.usdc_amount + usdc;

        // shell lp
        if config.pool_init {
            let shell_to_mint = cmp::min(
                trtn * config.shell_amount / config.trtn_amount,
                usdc * config.shell_amount / config.usdc_amount,
            );
            anchor_spl::token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::MintTo {
                        mint: ctx.accounts.shell_mint.to_account_info(),
                        to: ctx.accounts.auth_shell_account.to_account_info(),
                        authority: ctx.accounts.shell_mint.to_account_info(),
                    },
                    &[&[
                        config.key().as_ref(),
                        b"psdn_shell_account".as_ref(),
                        &[config.shell_bump],
                    ]],
                ),
                shell_to_mint,
            )?;
            config.shell_amount = config.shell_amount + shell_to_mint;
        } else {
            config.pool_init = true;
            let shell_to_mint = (((trtn as f64) * (usdc as f64)).sqrt() - 1000.0) as u64;
            anchor_spl::token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::MintTo {
                        mint: ctx.accounts.shell_mint.to_account_info(),
                        to: ctx.accounts.auth_shell_account.to_account_info(),
                        authority: ctx.accounts.shell_mint.to_account_info(),
                    },
                    &[&[
                        config.key().as_ref(),
                        b"psdn_shell_account".as_ref(),
                        &[config.shell_bump],
                    ]],
                ),
                shell_to_mint,
            )?;
            config.shell_amount = config.shell_amount + shell_to_mint;
        }

        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.auth_trtn_account.to_account_info(),
                    to: ctx.accounts.trtn_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            trtn,
        )?;
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.auth_usdc_account.to_account_info(),
                    to: ctx.accounts.usdc_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            usdc,
        )?;
        Ok(())
    }

    pub fn remove_liquidity(ctx: Context<ProvideLiquidity>, shell: u64) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        let trtn_to_send = config.trtn_amount * shell / config.shell_amount;
        let usdc_to_send = config.usdc_amount * shell / config.shell_amount;
        config.trtn_amount = config.trtn_amount - trtn_to_send;
        config.usdc_amount = config.usdc_amount - usdc_to_send;
        config.shell_amount = config.shell_amount - shell;

        anchor_spl::token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Burn {
                    mint: ctx.accounts.shell_mint.to_account_info(),
                    to: ctx.accounts.auth_shell_account.to_account_info(),
                    authority: ctx.accounts.auth_shell_account.to_account_info(),
                },
            ),
            shell,
        )?;

        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.trtn_account.to_account_info(),
                    to: ctx.accounts.auth_trtn_account.to_account_info(),
                    authority: ctx.accounts.trtn_account.to_account_info(),
                },
                &[&[
                    config.key().as_ref(),
                    b"psdn_trtn_account".as_ref(),
                    &[config.trtn_bump],
                ]],
            ),
            trtn_to_send,
        )?;
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.usdc_account.to_account_info(),
                    to: ctx.accounts.auth_usdc_account.to_account_info(),
                    authority: ctx.accounts.usdc_account.to_account_info(),
                },
                &[&[
                    config.key().as_ref(),
                    b"psdn_usdc_account".as_ref(),
                    &[config.usdc_bump],
                ]],
            ),
            trtn_to_send,
        )?;
        Ok(())
    }
}

// Data Validators
#[derive(Accounts)]
#[instruction(
  psdn_bump: u8,
  usdc_bump: u8,
  trtn_bump: u8,
  shell_bump: u8,
)]
pub struct Initialize<'info> {
    #[account(init_if_needed, seeds = [b"psdn_config".as_ref()], bump = psdn_bump, payer = authority, space = Config::LEN)]
    pub config: Box<Account<'info, Config>>,
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut, has_one = authority)]
    pub config: Box<Account<'info, Config>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SwapToTriton<'info> {
    #[account(mut, seeds = [b"psdn_config".as_ref()], bump = config.psdn_bump)]
    pub config: Box<Account<'info, Config>>,
    pub authority: Signer<'info>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_usdc_account".as_ref()], bump = config.usdc_bump)]
    pub usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_trtn_account".as_ref()], bump = config.trtn_bump)]
    pub trtn_account: Box<Account<'info, TokenAccount>>,
    pub usdc_mint: Box<Account<'info, Mint>>,
    pub trtn_mint: Box<Account<'info, Mint>>,
    #[account(init_if_needed, payer = authority, associated_token::mint = trtn_mint, associated_token::authority = authority)]
    pub auth_trtn_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub auth_usdc_account: Box<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SwapToUsdc<'info> {
    #[account(mut, seeds = [b"psdn_config".as_ref()], bump = config.psdn_bump)]
    pub config: Box<Account<'info, Config>>,
    pub authority: Signer<'info>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_usdc_account".as_ref()], bump = config.usdc_bump)]
    pub usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_trtn_account".as_ref()], bump = config.trtn_bump)]
    pub trtn_account: Box<Account<'info, TokenAccount>>,
    pub usdc_mint: Box<Account<'info, Mint>>,
    pub trtn_mint: Box<Account<'info, Mint>>,
    #[account(init_if_needed, payer = authority, associated_token::mint = usdc_mint, associated_token::authority = authority)]
    pub auth_usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub auth_trtn_account: Box<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ProvideLiquidity<'info> {
    #[account(mut, seeds = [b"psdn_config".as_ref()], bump = config.psdn_bump)]
    pub config: Box<Account<'info, Config>>,
    pub authority: Signer<'info>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_usdc_account".as_ref()], bump = config.usdc_bump)]
    pub usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_trtn_account".as_ref()], bump = config.trtn_bump)]
    pub trtn_account: Box<Account<'info, TokenAccount>>,
    pub usdc_mint: Box<Account<'info, Mint>>,
    pub trtn_mint: Box<Account<'info, Mint>>,
    #[account(init_if_needed, seeds = [config.key().as_ref(), b"psdn_shell_account".as_ref()], bump = config.shell_bump, mint::decimals = 6, mint::authority = shell_mint, payer = authority)]
    pub shell_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub auth_usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub auth_trtn_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = shell_mint,
        associated_token::authority = authority
    )]
    pub auth_shell_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut, seeds = [b"psdn_config".as_ref()], bump = config.psdn_bump)]
    pub config: Box<Account<'info, Config>>,
    pub authority: Signer<'info>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_usdc_account".as_ref()], bump = config.usdc_bump)]
    pub usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_trtn_account".as_ref()], bump = config.trtn_bump)]
    pub trtn_account: Box<Account<'info, TokenAccount>>,
    pub usdc_mint: Box<Account<'info, Mint>>,
    pub trtn_mint: Box<Account<'info, Mint>>,
    #[account(mut, seeds = [config.key().as_ref(), b"psdn_shell_account".as_ref()], bump = config.shell_bump)]
    pub shell_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub auth_usdc_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub auth_trtn_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub auth_shell_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

// Data Structures
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBKEY_LENGTH: usize = 32;
const BUMP_LENGTH: usize = 8;
const COIN_LENGTH: usize = 8;
const BOOL_LENGTH: usize = 8;

#[account]
pub struct Config {
    pub authority: Pubkey,
    pub psdn_bump: u8,
    pub usdc_bump: u8,
    pub trtn_bump: u8,
    pub shell_bump: u8,
    pub shell_amount: u64,
    pub usdc_amount: u64,
    pub trtn_amount: u64,
    pub pool_constant: u64,
    pub pool_init: bool,
}

impl Config {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBKEY_LENGTH
        + BUMP_LENGTH
        + BUMP_LENGTH
        + BUMP_LENGTH
        + BUMP_LENGTH
        + COIN_LENGTH
        + COIN_LENGTH
        + COIN_LENGTH
        + COIN_LENGTH
        + BOOL_LENGTH;
}

// Error Codes
#[error]
pub enum ErrorCode {
    #[msg("Too much of a ratio difference between liquidity and current pool.")]
    IncorrectRatio,
}
