package com.tecnoinf.tsig.stn.repository;

import com.tecnoinf.tsig.stn.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}