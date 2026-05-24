package com.hermes.hub.mapper;

import com.hermes.hub.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {

    User findByUsername(String username);

    void insert(User user);
}
