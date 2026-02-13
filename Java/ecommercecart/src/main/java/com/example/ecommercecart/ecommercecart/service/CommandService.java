package com.example.ecommercecart.ecommercecart.service;

// import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ecommercecart.ecommercecart.model.Command;
import com.example.ecommercecart.ecommercecart.repository.CommandRepository;

import lombok.Getter;

@Service
@Getter
public class CommandService {

    @Autowired
    private final CommandRepository commandRepository;

    // @Autowired
    // private final Products products;

    public CommandService(CommandRepository commandRepository) {
        this.commandRepository = commandRepository;
        // this.products = products;
    }

    public void deleteCommandById(long id) {
        commandRepository.deleteById(id);
    }

    public Command addCommand(Command command) {
        var newCom = commandRepository.save(command);
        return newCom;
    }

    public Command getCommandById(long id) {
        var comById = commandRepository.findById(id).orElse(null);
        return comById;
    }

    public List<Command> getAllCommands() {
        var getCom = commandRepository.findAll();
        return getCom;
    }

    public Command updateCommand(Command command) {
        var updatedCom = commandRepository.save(command);
        return updatedCom;
    }

    // public List<Command> getCommandByDate(LocalDateTime actualDate) {
    //     var getComDate = commandRepository.findCommandByDate(actualDate);
    //     return getComDate;
    // }

    // public Double getTotal(int qte) {
    //     return qte * products.getPrice();
    // } 

}
