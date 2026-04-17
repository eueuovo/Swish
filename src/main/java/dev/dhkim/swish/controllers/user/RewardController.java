package dev.dhkim.swish.controllers.user;

import dev.dhkim.swish.entities.user.UserEntity;
import dev.dhkim.swish.services.user.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reward")
public class RewardController {
    private final RewardService rewardService;

    @PostMapping("/daily")
    public Map<String, Object> claimDailyReward(
            @SessionAttribute(value = "sessionUser", required = false) UserEntity user) {

        if (user == null) {
            return Map.of("result", "UNAUTHORIZED");
        }

        return rewardService.claimDailyReward(user);
    }
}