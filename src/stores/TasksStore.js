
import { types } from "mobx-state-tree";
        
export default types
    .model("TasksStore", {
        
    }).views(self => ({
        buildLSFCallbacks() {
            return {
                onSubmitCompletion: function(ls, c, res) {
                    const task = self.getTask();
                    
                    if (task) {
                        if ('completions' in task)
                            task.completions.push(c)
                        else
                            task.completions = [ c ]
                    }
                },
                onTaskLoad: function(ls) {},
                onUpdateCompletion: function(ls, c) {
                    // TODO needs to update the update date
                },
                onDeleteCompletion: function(ls, c) {
                    const task = self.getTask();
                    if (task && task.completions) {
                        const cidx = task.completions.findIndex(tc => tc.id === c.id);
                        task.completions.splice(cidx, 1);
                    }
                },
                onSkipTask: function(ls) {
                    // TODO need to update the task status
                },
                onLabelStudioLoad: function(ls) {},
            };
        }
    })).actions(self => {
        let data = [],
            task = null;
        
        function setData(val) { data = val }
        function getData() { return data }
        
        function getAnnotationData() {
            return data.map(t => {
                return (t.completions) ?
                    t.completions.map(c => {
                        c['annotation_id'] = c.id;
                        c['task_id'] = t.id;
                        c['data'] = t.data;

                        return c;
                     }) : [];
            }).flat();
        }

        function getDataFields() {
            return Object.keys(data[0]['data'] || {});
        }
        
        function setTask(val) { task = val }
        function getTask() { return task }
        
        return {
            setData,
            getData,
            getDataFields,
            getAnnotationData,
            setTask,
            getTask
        }
    })
