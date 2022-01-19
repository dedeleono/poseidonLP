use anchor_lang::prelude::*;

use config::*;
mod config;

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
        config::handler(ctx, psdn_bump, usdc_bump, trtn_bump, shell_bump)
    }
}
