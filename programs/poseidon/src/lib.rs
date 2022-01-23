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

    pub fn update_config(ctx: Context<UpdateConfig>, trtn: u64, usdc: u64) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        config.pool_constant = 80085101 as u64;
        config.trtn_amount = trtn;
        config.usdc_amount = usdc;
        Ok(())
    }

    pub fn swap_to_triton(ctx: Context<SwapToTriton>, usdc_to_swap: u64) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        // msg!("trtn: {}", config.trtn_amount);
        // msg!("usdc: {}", config.usdc_amount);
        let pool_constant = (config.usdc_amount as u128) * (config.trtn_amount as u128);
        // msg!("pool_constant: {}", pool_constant);
        // msg!("usdc_to_swap: {}", usdc_to_swap);
        let new_usdc_amount = config.usdc_amount + usdc_to_swap;
        // msg!("new_usdc_amount: {}", new_usdc_amount);
        let new_trtn_amount = (pool_constant / new_usdc_amount as u128) as u64;
        // msg!("new_trtn_amount: {}", new_trtn_amount);
        let trtn_to_send = config.trtn_amount - new_trtn_amount;
        // msg!("trtn_to_send: {}", trtn_to_send);
        let trtn_after_fees = (trtn_to_send as f64 * 0.99) as u64;
        // msg!("trtn_after_fees: {}", trtn_after_fees);

        config.usdc_amount = new_usdc_amount;
        config.trtn_amount = config.trtn_amount - trtn_after_fees;
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
            trtn_after_fees,
        )?;
        Ok(())
    }

    pub fn swap_to_usdc(ctx: Context<SwapToUsdc>, trtn_to_swap: u64) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        // msg!("trtn: {}", config.trtn_amount);
        // msg!("usdc: {}", config.usdc_amount);
        let pool_constant = (config.usdc_amount as u128) * (config.trtn_amount as u128);
        // msg!("pool_constant: {}", pool_constant);
        // msg!("trtn_to_swap: {}", trtn_to_swap);
        let new_trtn_amount = config.trtn_amount + trtn_to_swap;
        // msg!("new_trtn_amount: {}", new_trtn_amount);
        let new_usdc_amount = (pool_constant / new_trtn_amount as u128) as u64;
        // msg!("new_usdc_amount: {}", new_usdc_amount);
        let usdc_to_send = config.usdc_amount - new_usdc_amount;
        // msg!("usdc_to_send: {}", usdc_to_send);
        let usdc_after_fees = (usdc_to_send as f64 * 0.99) as u64;
        // msg!("usdc_after_fees: {}", usdc_after_fees);

        config.trtn_amount = new_trtn_amount;
        config.usdc_amount = config.usdc_amount - usdc_after_fees;
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
            usdc_after_fees,
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

        // shell lp
        if config.pool_init {
            msg!("trtn: {}", trtn);
            msg!("usdc: {}", usdc);
            msg!("config.trtn_amount : {}", config.trtn_amount);
            msg!("config.usdc_amount: {}", config.usdc_amount);
            msg!("config.shell_amount: {}", config.shell_amount);

            let upcasted_trtn = trtn as u128;
            msg!("upcasted_trtn: {}", upcasted_trtn);
            let upcasted_usdc = usdc as u128;
            msg!("upcasted_usdc: {}", upcasted_usdc);
            let upcasted_trtn_config = config.trtn_amount as u128;
            msg!("upcasted_trtn_config: {}", upcasted_trtn_config);
            let upcasted_usdc_config = config.usdc_amount as u128;
            msg!("upcasted_usdc_config: {}", upcasted_usdc_config);
            let upcasted_shell_config = config.shell_amount as u128;
            msg!("upcasted_shell_config: {}", upcasted_shell_config);
            let parsed_trtn = upcasted_shell_config * upcasted_trtn / upcasted_trtn_config;
            msg!("parsed_trtn: {}", parsed_trtn);
            let parsed_usdc = upcasted_shell_config * upcasted_usdc / upcasted_usdc_config;
            msg!("parsed_usdc: {}", parsed_usdc);
            let shell_to_mint = cmp::min(parsed_trtn, parsed_usdc) as u64;
            msg!("shell_to_mint: {}", shell_to_mint);
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

        config.trtn_amount = config.trtn_amount + trtn;
        config.usdc_amount = config.usdc_amount + usdc;

        Ok(())
    }

    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, shell: u64) -> ProgramResult {
        let config = &mut ctx.accounts.config;
        let upcasted_shell = shell as u128;
        msg!("upcasted_shell: {}", upcasted_shell);
        let upcasted_trtn_config = config.trtn_amount as u128;
        msg!("upcasted_trtn_config: {}", upcasted_trtn_config);
        let upcasted_usdc_config = config.usdc_amount as u128;
        msg!("upcasted_usdc_config: {}", upcasted_usdc_config);
        let upcasted_shell_config = config.shell_amount as u128;
        msg!("upcasted_shell_config: {}", upcasted_shell_config);
        let trtn_to_send = (upcasted_shell * upcasted_trtn_config / upcasted_shell_config) as u64;
        msg!("trtn_to_send: {}", trtn_to_send);
        let usdc_to_send = (upcasted_shell * upcasted_usdc_config / upcasted_shell_config) as u64;
        msg!("usdc_to_send: {}", usdc_to_send);
        config.trtn_amount = config.trtn_amount - trtn_to_send;
        config.usdc_amount = config.usdc_amount - usdc_to_send;
        config.shell_amount = config.shell_amount - shell;

        // anchor_spl::token::transfer(
        //     CpiContext::new(
        //         ctx.accounts.token_program.to_account_info(),
        //         Transfer {
        //             from: ctx.accounts.auth_shell_account.to_account_info(),
        //             to: ctx.accounts.shell_mint.to_account_info(),
        //             authority: ctx.accounts.authority.to_account_info(),
        //         },
        //     ),
        //     shell,
        // )?;

        // anchor_spl::token::burn(
        //     CpiContext::new(
        //         ctx.accounts.token_program.to_account_info(),
        //         anchor_spl::token::Burn {
        //             mint: ctx.accounts.shell_mint.to_account_info(),
        //             to: ctx.accounts.shell_mint.to_account_info(),
        //             authority: ctx.accounts.shell_mint.to_account_info(),
        //         },
        //     ),
        //     shell,
        // )?;

        anchor_spl::token::burn(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Burn {
                    mint: ctx.accounts.shell_mint.to_account_info(),
                    to: ctx.accounts.auth_shell_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                &[&[
                    config.key().as_ref(),
                    b"psdn_shell_account".as_ref(),
                    &[config.shell_bump],
                ]],
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
            usdc_to_send,
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
