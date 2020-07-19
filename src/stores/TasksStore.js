
import { types } from "mobx-state-tree";
        
export default types
    .model("TasksStore", {
        
    }).views(self => ({
        buildLSFCallbacks() {
            return {
                onSubmitCompletion: function(ls, c) {
                    const task = self.getTask();                    
                    if (task) {
                        if ('completions' in task)
                            task.completions.push(c)
                        else
                            task.completions = [c]
                    }
                },
                onTaskLoad: function(ls) {},
                onUpdateCompletion: function(ls, c) {},
                onDeleteCompletion: function(ls, c) {},
                onSkipTask: function(ls) {},
                onLabelStudioLoad: function(ls) {},
            };
        }
    })).actions(self => {
        let data = [],
            task = null;
        
        function setData(val) { data = val }
        function getData() { return data }

        function setTask(val) { task = val }
        function getTask() { return task }
        
        return {
            setData,
            getData,
            setTask,
            getTask
        }
    })
