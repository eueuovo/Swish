package dev.dhkim.swish.mappers;

import dev.dhkim.swish.entities.user.EnhanceWandEntity;
import dev.dhkim.swish.entities.user.UserEntity;
import dev.dhkim.swish.entities.user.WandEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserMapper {
    void register(UserEntity userEntity);

    UserEntity login(@Param("loginId") String loginId, @Param("password") String password);

    UserEntity findByNickname(@Param("nickname") String nickname);

    UserEntity findByLoginId(@Param("loginId") String loginId);

    void updateDorm(@Param("userId") int userId, @Param("dormId") int dormId);

    List<WandEntity> findAllWands();

    void updateWand(@Param("userId") int userId, @Param("wandId") Integer wandId);

    WandEntity findWandById(@Param("wandId") int wandId);

    EnhanceWandEntity findEnhanceWand(@Param("wandId") int wandId, @Param("rank") int rank);

    void updateLastDailyRewardAt(@Param("id") int id, @Param("lastDailyRewardAt") LocalDateTime lastDailyRewardAt);

    void addItem(@Param("userId") int userId, @Param("itemId") int itemId, @Param("itemCount") int itemCount);

    Integer findDormRank(@Param("dormId") int dormId);
    void addGalleon(@Param("userId") int userId, @Param("galleon") int galleon);
    void addCoin(@Param("userId") int userId, @Param("coin") int coin);

    void updateWandRank(@Param("userId") int userId, @Param("rank") int rank);
}
