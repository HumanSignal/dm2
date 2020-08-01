
import { types, getRoot, getSnapshot } from "mobx-state-tree";
        
export default types
    .model("TasksStore", {
        selectedTaskID: types.maybeNull(types.number)
    }).views(self => ({
        get root() {
            return getRoot(self);
        },
        
        buildLSFCallbacks() {
            return {
                beforeUpdateCompletion: function (ls) {
                    // called before completion is updated
                    const ops = self.root.operationsStore;
                    return ops.allSelected.map(op => op.id);
                },
                
                beforeSubmitCompletion: function (ls) {
                    // called before completion is submitted
                    // const ops = self.root.operationsStore;
                    // return ops.allSelected.map(op => getSnapshot(op));
                    const ops = self.root.operationsStore;
                    return ops.allSelected.map(op => op.id);
                },
                
                onSubmitCompletion: function(ls, c, res) {
                    const task = self.getTask();
                    
                    if (task) {
                        if ('completions' in task)
                            task.completions.push(c)
                        else
                            task.completions = [ c ]
                    }
                },
                onTaskLoad: function(ls, rawData) {
                    // task loaded, get rawData and populate LOPs
                    // console.log(rawData);
                    // const ops = self.root.operationsStore;
                    // ops.reset();
                    
                    // if ("predictions" in rawData) {
                    //     const { lops } = rawData["predictions"][0];
                    //     lops.forEach(lop => {
                    //         ops.addOp(lop);
                    //     });
                    // }
                },
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
            task = null,
            lsf = null;
        
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
        
        function setTask(val) {
            task = val;
            self.selectedTaskID = task.id;
        }
        function getTask() { return task; }

        function setLSF(val) { lsf = val; }
        function getLSF() { return lsf; }

        function nextTask() {
            
        }

        function prevTask() {

        }
        
        return {
            setData,
            getData,
            getDataFields,
            getAnnotationData,
            setTask,
            getTask,
            setLSF,
            getLSF,
            nextTask,
            prevTask
        }
    })
