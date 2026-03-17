package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // ✅ Added import
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // ✅ Injected from application.properties
    @Value("${app.security.max-failed-attempts}")
    private int maxFailedAttempts;

    @Value("${app.security.lock-duration}")
    private long lockDuration;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        // ✅ AUTO UNLOCK CHECK
        if (!user.getAccountNonLocked()) {
            if (user.getLockTime() != null) {
                if (unlockWhenTimeExpired(user)) {
                    // account unlocked automatically
                }
            }
        }

        return UserDetailsImpl.build(user);
    }

    @Transactional
    public void increaseFailedAttempts(User user) {
        int newFailAttempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(newFailAttempts);

        // ✅ Use injected value
        if (newFailAttempts >= maxFailedAttempts) {
            user.setAccountNonLocked(false);
            user.setLockTime(new Date());
        }

        userRepository.save(user);
    }

    @Transactional
    public void resetFailedAttempts(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            if (user.getFailedAttempts() > 0) {
                user.setFailedAttempts(0);
                userRepository.save(user);
            }
        });
    }

    // ✅ Unlock when lock time expires
    public boolean unlockWhenTimeExpired(User user) {

        long lockTimeInMillis = user.getLockTime().getTime();
        long currentTimeInMillis = System.currentTimeMillis();

        // ✅ Use injected lockDuration
        if (lockTimeInMillis + lockDuration < currentTimeInMillis) {

            user.setAccountNonLocked(true);
            user.setLockTime(null);
            user.setFailedAttempts(0);

            userRepository.save(user);

            return true;
        }

        return false;
    }
}