package com.hermes.hub.mapper;

import com.hermes.hub.entity.TaskEvent;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TaskEventMapper {

    void insert(TaskEvent taskEvent);

    List<TaskEvent> selectByTaskId(String taskId);

    List<TaskEvent> selectLatest(int limit);

    List<TaskEvent> selectBySeqRange(long from, long to);

    long countByTaskId(String taskId);
}
