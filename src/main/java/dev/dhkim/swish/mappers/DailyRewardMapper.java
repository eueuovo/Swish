package dev.dhkim.swish.mappers;

import dev.dhkim.swish.entities.reward.DailyRewardEntity;
import dev.dhkim.swish.entities.reward.DailyRewardItemEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface DailyRewardMapper {
    DailyRewardEntity findCommonReward();

    DailyRewardEntity findByDormRank(int dormRank);

    List<DailyRewardItemEntity> findItemsByRewardId(int dailyRewardId);
}
