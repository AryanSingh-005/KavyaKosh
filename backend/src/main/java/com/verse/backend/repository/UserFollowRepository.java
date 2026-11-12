package com.verse.backend.repository;

import com.verse.backend.document.UserFollowDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserFollowRepository extends MongoRepository<UserFollowDocument, String> {
    Optional<UserFollowDocument> findByFollowerUsernameAndFollowingUsername(String follower, String following);
    long countByFollowingUsername(String following);
    long countByFollowerUsername(String follower);
    boolean existsByFollowerUsernameAndFollowingUsername(String follower, String following);
    void deleteByFollowerUsernameAndFollowingUsername(String follower, String following);
}
