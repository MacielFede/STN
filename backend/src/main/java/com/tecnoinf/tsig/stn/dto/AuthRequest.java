package com.tecnoinf.tsig.stn.dto;

public record AuthRequest(
        String username,
        String password
) { }