use anchor_lang::prelude::*;

use config::*;
mod config;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod poseidon {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        psdn_bump: u8,
        usdc_bump: u8,
        trtn_bump: u8,
    ) -> ProgramResult {
        config::handler(ctx, psdn_bump, usdc_bump, trtn_bump)
    }
}
