package com.example.demo.seminar.service;

import com.example.demo.seminar.entity.Seminar;
import com.example.demo.seminar.repository.SeminarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SeminarService {

    @Autowired
    private SeminarRepository seminarRepository;

    public List<Seminar> getCompletedSeminars(Long userId) {
        return seminarRepository.findByUserIdAndCompletedOrderByDateDesc(userId, true);
    }

    public List<Seminar> getQueuedSeminars(Long userId) {
        return seminarRepository.findByUserIdAndCompletedOrderByDateDesc(userId, false);
    }

    public Seminar saveSeminar(Seminar seminar) {
        return seminarRepository.save(seminar);
    }

    public void deleteSeminar(Long id) {
        seminarRepository.deleteById(id);
    }
}