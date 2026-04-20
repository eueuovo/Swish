package dev.dhkim.swish.services.main;

import dev.dhkim.swish.entities.item.ItemEntity;
import dev.dhkim.swish.entities.reward.DailyRewardEntity;
import dev.dhkim.swish.entities.reward.DailyRewardItemEntity;
import dev.dhkim.swish.entities.user.EnhanceWandEntity;
import dev.dhkim.swish.entities.user.UserEntity;
import dev.dhkim.swish.entities.user.WandEntity;
import dev.dhkim.swish.mappers.DailyRewardMapper;
import dev.dhkim.swish.mappers.UserMapper;
import dev.dhkim.swish.services.item.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MainService {
    private final DailyRewardMapper dailyRewardMapper;
    private final UserMapper userMapper;
    private final ItemService itemService;

    public Map<String, Object> getDailyRewardInfo(UserEntity user) {
        Map<String, Object> result = new HashMap<>();

        DailyRewardEntity commonReward = dailyRewardMapper.findCommonReward();
        DailyRewardEntity dormReward = null;
        if (user.getDormId() != null) {
            Integer dormRank = userMapper.findDormRank(user.getDormId());
            if (dormRank != null) {
                dormReward = dailyRewardMapper.findByDormRank(dormRank);
            }
        }

        List<DailyRewardItemEntity> rewardItems = dailyRewardMapper.findItemsByRewardId(commonReward.getId());
        Map<Integer, ItemEntity> itemMap = new HashMap<>();
        for (DailyRewardItemEntity rewardItem : rewardItems) {
            itemMap.put(rewardItem.getItemId(), itemService.getItemById(rewardItem.getItemId()));
        }

        result.put("commonReward", commonReward);
        result.put("dormReward", dormReward);
        result.put("rewardItems", rewardItems);
        result.put("itemMap", itemMap);
        return result;
    }

    public Map<String, Object> claimDailyReward(UserEntity user) {
        Map<String, Object> result = new HashMap<>();

        // 오늘 이미 수령했는지 체크
        LocalDateTime now = LocalDateTime.now();
        if (user.getLastDailyRewardAt() != null) {
            LocalDate lastDate = user.getLastDailyRewardAt().toLocalDate();
            if (lastDate.equals(now.toLocalDate())) {
                result.put("success", false);
                result.put("message", "오늘은 이미 지원금을 수령했어요!");
                return result;
            }
        }

        // 공통 보상 (출석 갈레온)
        DailyRewardEntity commonReward = dailyRewardMapper.findCommonReward();
        int totalGalleon = commonReward.getGalleon();

        // 기숙사 보상
        if (user.getDormId() != null) {
            Integer dormRank = userMapper.findDormRank(user.getDormId());
            if (dormRank != null) {
                DailyRewardEntity dormReward = dailyRewardMapper.findByDormRank(dormRank);
                if (dormReward != null) {
                    totalGalleon += dormReward.getGalleon();
                }
            }
        }

        // 아이템 지급
        List<DailyRewardItemEntity> rewardItems = dailyRewardMapper.findItemsByRewardId(commonReward.getId());
        for (DailyRewardItemEntity rewardItem : rewardItems) {
            userMapper.addItem(user.getId(), rewardItem.getItemId(), rewardItem.getItemCount());
        }

        // 갈레온 지급 + 수령 시간 업데이트
        userMapper.addGalleon(user.getId(), totalGalleon);
        userMapper.updateLastDailyRewardAt(user.getId(), now);

        // 세션 유저 갱신
        user.setGalleon(user.getGalleon() + totalGalleon);
        user.setLastDailyRewardAt(now);

        result.put("success", true);
        result.put("message", "지원금을 수령했어요!");
        result.put("galleon", totalGalleon);
        result.put("totalGalleon", user.getGalleon());
        return result;
    }

    public Map<String, Object> enhance(UserEntity user) {
        Map<String, Object> result = new HashMap<>();

        int currentRank = user.getWandRank();

        // 확률·비용 조회
        int successRate, maintainRate, enhanceCost;

        if (currentRank == 1) {
            WandEntity wand = userMapper.findWandById(user.getWandId());
            successRate  = wand.getSuccess();
            maintainRate = wand.getMaintain();
            enhanceCost  = wand.getEnhanceCost();
        } else {
            EnhanceWandEntity ew = userMapper.findEnhanceWand(user.getWandId(), currentRank);
            if (ew == null) {
                result.put("success", false);
                result.put("message", "이미 최대 강화 단계입니다.");
                return result;
            }
            successRate  = ew.getSuccess();
            maintainRate = ew.getMaintain();
            enhanceCost  = ew.getEnhanceCost();
        }

        // 갈레온 부족 체크
        if (user.getGalleon() < enhanceCost) {
            result.put("success", false);
            result.put("message", "갈레온이 부족해요.");
            return result;
        }

        // 갈레온 차감
        userMapper.addGalleon(user.getId(), -enhanceCost);
        user.setGalleon(user.getGalleon() - enhanceCost);

        // 확률 판정 (0~99)
        int roll = (int) (Math.random() * 100);
        String enhanceResult;
        int newRank = currentRank;

        if (roll < successRate) {
            // ✅ 다음 강화 데이터 존재 여부 먼저 확인
            EnhanceWandEntity nextWand = userMapper.findEnhanceWand(user.getWandId(), currentRank + 1);
            if (nextWand == null) {
                result.put("success", false);
                result.put("message", "최대 강화 단계입니다.");
                // 차감한 갈레온 환불
                userMapper.addGalleon(user.getId(), enhanceCost);
                user.setGalleon(user.getGalleon() + enhanceCost);
                return result;
            }
            enhanceResult = "SUCCESS";
            newRank = currentRank + 1;

            int score;

            if (currentRank == 1) {
                WandEntity wand = userMapper.findWandById(user.getWandId());
                score = wand.getScore();
            } else {
                EnhanceWandEntity ew = userMapper.findEnhanceWand(user.getWandId(), currentRank);
                score = ew.getScore();
            }
            userMapper.addUserScore(user.getId(), score);
        } else if (roll < successRate + maintainRate) {
            enhanceResult = "MAINTAIN";
        } else {
            // 파괴 → 랜덤 지팡이 재배정
            enhanceResult = "DESTROY";
            newRank = 1;

            // wand 테이블에서 probability 기반 랜덤 뽑기
            List<WandEntity> allWands = userMapper.findAllWands(); // id, probability 포함

            int newWandId = pickRandomWand(allWands);
            userMapper.updateWand(user.getId(), newWandId);  // wand_id 변경
            user.setWandId(newWandId);
        }

        // DB·세션 반영
        userMapper.updateWandRank(user.getId(), newRank);
        user.setWandRank(newRank);

        result.put("success", true);
        result.put("result", enhanceResult);
        result.put("newRank", newRank);
        result.put("remainGalleon", user.getGalleon());

        if ("DESTROY".equals(enhanceResult)) {
            WandEntity newWand = userMapper.findWandById(user.getWandId());
            result.put("newWandName", newWand.getName());
            result.put("newWandImage", newWand.getImage());
            result.put("newSuccess", newWand.getSuccess());
            result.put("newMaintain", newWand.getMaintain());
            result.put("newFail", newWand.getFail());
            result.put("newEnhanceCost", newWand.getEnhanceCost());
        } else {
            // SUCCESS면 다음 강화(newRank+1) 확률, MAINTAIN이면 현재(newRank) 확률 그대로
            int statRank = "SUCCESS".equals(enhanceResult) ? newRank + 1 : newRank;
            EnhanceWandEntity nextStat = userMapper.findEnhanceWand(user.getWandId(), statRank); // ✅
            if (nextStat != null) {
                result.put("newWandImage", nextStat.getImage());
                result.put("newSuccess", nextStat.getSuccess());
                result.put("newMaintain", nextStat.getMaintain());
                result.put("newFail", nextStat.getFail());
                result.put("newEnhanceCost", nextStat.getEnhanceCost());
            }
        }

        result.put("dormRanking", getDormRanking());

        return result;
    }

    private int pickRandomWand(List<WandEntity> wands) {
        // probability 합산
        float total = 0f;
        for (WandEntity w : wands) {
            total += w.getProbability();
        }

        float roll = (float) (Math.random() * total);
        float cursor = 0f;

        for (WandEntity w : wands) {
            cursor += w.getProbability();
            if (roll < cursor) {
                return w.getId();
            }
        }

        // 혹시 못 뽑히면 마지막 거 반환
        return wands.get(wands.size() - 1).getId();
    }

    public Map<String, Object> sell(UserEntity user) {
        Map<String, Object> result = new HashMap<>();

        int currentRank = user.getWandRank();
        int sellPrice;

        if (currentRank == 1) {
            WandEntity wand = userMapper.findWandById(user.getWandId());
            sellPrice = wand.getSellPrice();
        } else {
            EnhanceWandEntity ew = userMapper.findEnhanceWand(user.getWandId(), currentRank);
            if (ew == null) {
                result.put("success", false);
                result.put("message", "판매 정보를 찾을 수 없어요.");
                return result;
            }
            sellPrice = ew.getSellPrice();
        }

        // 갈레온 지급
        userMapper.addGalleon(user.getId(), sellPrice);
        user.setGalleon(user.getGalleon() + sellPrice);

        // 지팡이 초기화 (wand_id null, wand_rank 1로)
        List<WandEntity> allWands = userMapper.findAllWands();
        int newWandId = pickRandomWand(allWands);
        userMapper.updateWand(user.getId(), newWandId);
        userMapper.updateWandRank(user.getId(), 1);
        user.setWandId(newWandId);
        user.setWandRank(1);

        WandEntity newWand = userMapper.findWandById(newWandId);
        result.put("newWandName", newWand.getName());
        result.put("newWandImage", newWand.getImage());
        result.put("newSuccess", newWand.getSuccess());
        result.put("newMaintain", newWand.getMaintain());
        result.put("newFail", newWand.getFail());

        result.put("success", true);
        result.put("message", "판매 완료!");
        result.put("sellPrice", sellPrice);
        result.put("remainGalleon", user.getGalleon());
        return result;
    }

    public List<Map<String, Object>> getDormRanking() {
        return userMapper.findDormRanking();
    }
}