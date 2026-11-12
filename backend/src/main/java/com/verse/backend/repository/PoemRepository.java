package com.verse.backend.repository;

import com.verse.backend.entity.Poem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PoemRepository extends JpaRepository<Poem, Long> {

    @Query("SELECT p FROM Poem p WHERE p.published = true ORDER BY p.trendingScore DESC")
    List<Poem> findTopTrending(Pageable pageable);
}
