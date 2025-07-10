package com.tecnoinf.tsig.stn.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyRequest(@NotBlank String name) { }
