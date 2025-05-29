package com.tecnoinf.tsig.stn.dto;

public record RegisterRequest(
        String username,
        String password
) { }