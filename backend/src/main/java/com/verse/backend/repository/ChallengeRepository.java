package com.verse.backend.repository;

import com.verse.backend.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    List<Challenge> findByStatusOrderByDeadlineAsc(Challenge.Status status);
}
