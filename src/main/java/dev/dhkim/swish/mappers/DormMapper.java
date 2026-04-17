package dev.dhkim.swish.mappers;

import dev.dhkim.swish.entities.user.DormQuestionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DormMapper {
    List<DormQuestionEntity> selectQuestionsWithAnswers();

    void updateUserDorm(@Param("userId") int userId,
                        @Param("dormId") int dormId);
}
