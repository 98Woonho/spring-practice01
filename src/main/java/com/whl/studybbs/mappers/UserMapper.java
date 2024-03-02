package com.whl.studybbs.mappers;

import com.whl.studybbs.entities.ContactCompanyEntity;
import com.whl.studybbs.entities.EmailAuthEntity;
import com.whl.studybbs.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int insertEmailAuth(EmailAuthEntity emailAuth);

    int insertUser(UserEntity user);

    ContactCompanyEntity[] selectContactCompanies();

    EmailAuthEntity selectEmailAuthByEmailCodeSalt(@Param(value = "email") String email,
                                                   @Param(value = "code") String code,
                                                   @Param(value = "salt") String salt);

    UserEntity selectUserByEmail(@Param(value = "email") String email);
    UserEntity selectUserByNickname(@Param(value = "nickname") String nickname);
    UserEntity selectUserByContact(@Param(value = "contactFirst") String contactFirst,
                                   @Param(value = "contactSecond") String contactSecond,
                                   @Param(value = "contactThird") String contactThird);


    int updateEmailAuth(EmailAuthEntity emailAuth);

    int updateUser(UserEntity user);
}
