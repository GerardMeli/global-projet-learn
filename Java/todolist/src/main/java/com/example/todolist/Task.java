package com.example.todolist;

import java.time.LocalDateTime;

public class Task {

    private int id;
    private String taskName;
    private String taskDescripton;
    private LocalDateTime taskCreateAt;
    private boolean isComplet;

    public Task(int id, String taskName, String taskDescription, LocalDateTime taskCreatAt, boolean isComplet) {
        this.id = id;
        this.taskName = taskName;
        this.taskDescripton = taskDescription;
        this.isComplet = isComplet;
        this.taskCreateAt = taskCreatAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getTaskDescripton() {
        return taskDescripton;
    }

    public void setTaskDescripton(String taskDescripton) {
        this.taskDescripton = taskDescripton;
    }

    public LocalDateTime getTaskCreateAt() {
        return taskCreateAt;
    }

    public void setTaskCreateAt(LocalDateTime taskCreateAt) {
        this.taskCreateAt = taskCreateAt;
    }

    public boolean isComplet() {
        return isComplet;
    }

    public void setComplet(boolean isComplet) {
        this.isComplet = isComplet;
    }

    @Override
    public String toString() {
        return "id = " + id + 
                "taskName = " + taskName + 
                "taskDescripton = " + taskDescripton + 
                "taskCreateAt = " + taskCreateAt + 
                "isComplet = " + isComplet + 
                "############################################";
    }

}
