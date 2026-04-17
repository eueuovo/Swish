package dev.dhkim.swish.services.user;

import dev.dhkim.swish.entities.reward.DailyRewardEntity;
import dev.dhkim.swish.entities.reward.DailyRewardItemEntity;
import dev.dhkim.swish.entities.user.UserEntity;
import dev.dhkim.swish.mappers.DailyRewardMapper;
import dev.dhkim.swish.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RewardService {
    private final DailyRewardMapper dailyRewardMapper;
    private final UserMapper userMapper;

    public Map<String, Object> claimDailyReward(UserEntity user) {
        Map<String, Object> result = new HashMap<>();

        // 오늘 이미 받았는지 체크
        if (user.getLastDailyRewardAt() != null &&
                user.getLastDailyRewardAt().toLocalDate().equals(LocalDate.now())) {
            result.put("result", "ALREADY_CLAIMED");
            return result;
        }

        // 공통 지원금
        DailyRewardEntity commonReward = dailyRewardMapper.findCommonReward();

        // 기숙사 랭킹별 지원금 (기숙사 배정 안됐으면 null)
        DailyRewardEntity dormReward = null;
        if (user.getDormId() != null) {
            int dormRank = userMapper.findDormRank(user.getDormId()); // 기숙사 랭킹 조회
            dormReward = dailyRewardMapper.findByDormRank(dormRank);
        }

        // 갈레온 합산
        int totalGalleon = commonReward.getGalleon() + (dormReward != null ? dormReward.getGalleon() : 0);
        int totalCoin = commonReward.getCoin() + (dormReward != null ? dormReward.getCoin() : 0);

        // 아이템 조회
        List<DailyRewardItemEntity> items = dailyRewardMapper.findItemsByRewardId(commonReward.getId());

        // 지급 처리
        userMapper.addGalleon(user.getId(), totalGalleon);
        userMapper.addCoin(user.getId(), totalCoin);
        // TODO: 아이템 지급

        // last_daily_reward_at 업데이트
        userMapper.updateLastDailyRewardAt(user.getId(), LocalDateTime.now());

        result.put("result", "SUCCESS");
        result.put("galleon", totalGalleon);
        result.put("coin", totalCoin);
        result.put("items", items);
        return result;
    }
}
