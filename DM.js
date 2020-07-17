
import React from 'react';
import { observer, inject, Provider } from "mobx-react";

import styled from 'styled-components';
import { Pagination, Switch, Menu, Dropdown, Tabs, Button } from 'antd';
import { DownOutlined, UserOutlined, PlayCircleOutlined,
         AppstoreAddOutlined, EyeOutlined, FilterOutlined,
         AppstoreOutlined, BarsOutlined, CaretDownOutlined } from '@ant-design/icons';

import { useTable, usePagination, useRowSelect, useExpanded,
         useFilters, useGlobalFilter, useResizeColumns } from 'react-table';

import matchSorter from 'match-sorter';

import { GlobalFilter, DefaultColumnFilter, SelectColumnFilter,
         SliderColumnFilter, NumberRangeColumnFilter,
         fuzzyTextFilterFn, filterGreaterThan } from "./GlobalFilter";

import AppStore from './stores/AppStore';

const { TabPane } = Tabs;

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }

      .resizer {
        display: inline-block;
        background: blue;
        width: 10px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(50%);
        z-index: 1;
        ${'' /* prevents from scrolling while dragging on touch devices */}
        touch-action:none;

        &.isResizing {
          background: red;
        }
      }
    }
  }
`;

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;
    
    React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);
    
    return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
    );
});

function Table({ columns, data }) {
    const filterTypes = React.useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id];
                    return rowValue !== undefined
                        ? String(rowValue)
                        .toLowerCase()
                        .startsWith(String(filterValue).toLowerCase())
                        : true;
                });
            },
        }),
        []
    );

    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
        visibleColumns,
        selectedFlatRows,
        preGlobalFilteredRows,
        setGlobalFilter,
        state: { selectedRowIds },
    } = useTable(
        {
            columns,
            data            
        },
        useFilters, // useFilters!
        useResizeColumns,
        // maybe?
        // useGlobalFilter, // useGlobalFilter!
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                          <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({ row }) => (
                        <div>
                          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ]);
        }
    );

    // Render the UI for your table
    return (
        <>
          <table {...getTableProps()} style={{ width: "100%" }}>
            <thead>
              {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()} style={{ background: "#ccc" }}>
                    {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps()}>
                          {column.render('Header')}
                          <div>{column.canFilter ? column.render('Filter') : null}</div>

                          {/* this is resize the column code which we may need  */}
                          {/* <div */}
                          {/*   {...column.getResizerProps()} */}
                          {/*   className={`resizer ${column.isResizing ? "isResizing" : ""}`} */}
                          {/* /> */}
                        </th>
                    ))}
                  </tr>
              ))}

              {/* <tr> */}
              {/*   <th colSpan={visibleColumns.length} */}
              {/*     style={{ */}
              {/*       textAlign: 'left', */}
              {/*     }}> */}

              {/* maybe we show that on Ctrl+f? */}
              {/* <GlobalFilter preGlobalFilteredRows={preGlobalFilteredRows} */}
              {/*                   globalFilter={state.globalFilter} */}
              {/*                   setGlobalFilter={setGlobalFilter} */}
              {/* /> */}
              {/* </th> */}
              {/*     </tr> */}
            </thead>
            <tbody {...getTableBodyProps()}>

              {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                            return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                        })}
                      </tr>
                  );
              })}
              
            </tbody>
          </table>
          <p>Selected Completions: {Object.keys(selectedRowIds).length}</p>
          
        </>
    );
}


const FieldsMenu = observer(({ item, store }) => {
    const menuItem = (f) => 
          <Menu.Item key={f.key}>
            { f.canToggle ? <Switch defaultChecked /> : null }
            { f.title }
          </Menu.Item>;
    
    return (
        <Menu size="small" onClick={() => {}}>
          <Menu.ItemGroup title="Tasks">{ item.fieldsSource('tasks').map(menuItem) }</Menu.ItemGroup>
          <Menu.ItemGroup title="Annotations">{ item.fieldsSource('annotations').map(menuItem) }</Menu.ItemGroup>
          <Menu.ItemGroup title="Input">{ item.fieldsSource('inputs').map(menuItem) }</Menu.ItemGroup>
          
          <Menu.ItemGroup title="v2: Results">
            <Menu.Item key="5">class</Menu.Item>
          </Menu.ItemGroup>
        </Menu>
    );
});

const actionsMenu = (
    <Menu onClick={() => {}}>
      <Menu.Item key="1">Delete</Menu.Item>
    </Menu>
);

const DmPanel = observer(({ item }) => {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1em", marginBottom: "1em" }}>
          <div>
            <Button disabled={item.type === 'list'} onClick={() => item.setType('list')}><BarsOutlined />List</Button>
            <Button disabled={item.type === 'grid'} onClick={() => item.setType('grid')}><AppstoreOutlined />Grid</Button>
            &nbsp;&nbsp;
            <Button disabled={item.target === 'tasks'} onClick={() => item.setTarget('tasks')}>Tasks</Button>
            <Button disabled={item.target === 'annotations'} onClick={() => item.setTarget('annotations')}>Annotations</Button>
            &nbsp;&nbsp;
            <Dropdown overlay={<FieldsMenu item={item} />}><Button><EyeOutlined /> Fields <CaretDownOutlined /></Button></Dropdown>&nbsp;
            <Button type={item.filters ? "primary" : ""} onClick={() => item.toggleFilters()}><FilterOutlined /> Filters </Button>&nbsp;
          </div>
          <div>
            <Button><PlayCircleOutlined />Label All</Button>&nbsp;
            <Dropdown overlay={actionsMenu}><Button>Actions <CaretDownOutlined /></Button></Dropdown>
          </div>
        </div>
    );
});
 
const DmPaneMenu = (
    <Menu>
      <Menu.Item key="0">
        <a href="http://www.alipay.com/">Rename</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="http://www.taobao.com/">Duplicate</a>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">Close</Menu.Item>
    </Menu>
);

function DmTabPane(title) {
    return (
        <span>
          {title}
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Dropdown overlay={DmPaneMenu} trigger={['click']}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
              <DownOutlined />
            </a>
          </Dropdown>
        </span>
    );
}

const DmPaneContent = inject("store")(observer(({ item, store }) => {
    const columns = item.fieldsAsColumns;

    console.log(columns);
    
    // const columns = React.useMemo(() => [
    //     {
    //         Header: 'ID',
    //         accessor: 'id',
    //         Filter: NumberRangeColumnFilter,
    //         filter: 'between',
    //         // Filter: DefaultColumnFilter,
    //     },
        
    //     {
    //         Header: 'Status',
    //         accessor: 'status',
    //         Filter: SelectColumnFilter,
    //         filter: 'includes',
    //     },
    //     {
    //         Header: 'Annotations',
    //         accessor: 'annotations_num',
    //         Filter: SliderColumnFilter,
    //         filter: filterGreaterThan,
    //     },
    //     {
    //         Header: 'Source',
    //         accessor: 'source',
    //         disableFilters: true,
    //     },
    //     {
    //         Header: 'Created On',
    //         accessor: 'created_on',
    //         disableFilters: true,
    //         // Filter: SliderColumnFilter,
    //         // filter: filterGreaterThan,
    //     },
    // ], []);

    // const data = React.useMemo(() => makeData(100000), [])
    const data = [
        {
            'id': 1,
            'status': 'ready',
            'annotations': [{ }, {}, {}],
            'annotations_num': 3,
            'source': 'file.csv',
            'created_on': 'Fri 8'
        },
        {
            'id': 2,
            'status': 'ready',
            'annotations': [{ }, {}, {}],
            'annotations_num': 3,
            'source': 'file2.csv',
            'created_on': 'Fri 9'
        }
    ];
    
    const [originalData] = React.useState(data);
    const [skipPageReset, setSkipPageReset] = React.useState(false);
        
    return (
        <div>
          <div style={{background: "white"}}>
            <DmPanel item={item} />
          </div>
          <div style={{background: "#f1f1f1"}}>
            <Table columns={columns} data={data} 
                   skipPageReset={skipPageReset} />
          </div>
          <Pagination defaultCurrent={1} total={50} />
        </div>
    );
}));

const DmTabs = inject("store")(
  observer(

class DmTabs extends React.Component {
    constructor(props) {
        super(props);
        this.newTabIndex = 0;

        const store = this.props.store;

        const panes = store.viewsStore.all.map(c => {
            c['content'] = <DmPaneContent item={c} store={store} />;
            return c;
        });
        
        this.state = {
            activeKey: panes[0].key,
            panes: panes,
        };
    }

    onChange = activeKey => {
        this.setState({ activeKey });
    };

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    };

    add = () => {
        const { panes } = this.state;
        const activeKey = `newTab${this.newTabIndex++}`;
        panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
        this.setState({ panes, activeKey });
    };

    remove = targetKey => {
        let { activeKey } = this.state;
        let lastIndex;
        this.state.panes.forEach((pane, i) => {
            if (pane.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const panes = this.state.panes.filter(pane => pane.key !== targetKey);
        if (panes.length && activeKey === targetKey) {
            if (lastIndex >= 0) {
                activeKey = panes[lastIndex].key;
            } else {
                activeKey = panes[0].key;
            }
        }
        this.setState({ panes, activeKey });
    };

    render() {
        return (
            <Tabs tabBarStyle={{margin: 0, height: "40px" }}
                  onChange={this.onChange}
                  activeKey={this.state.activeKey}
                  type="editable-card"
                  onEdit={this.onEdit}
            >
              {this.state.panes.map(pane => (
                  <TabPane tab={DmTabPane(pane.title)} key={pane.key} closable={false}>
                    {pane.content}
                  </TabPane>
              ))}
            </Tabs>
        );
    }
}));

function App() {
    const app = AppStore.create({
        viewsStore: {
            views: [{
                fields: [
                    // tasks
                    { title: "ID", accessor: 'id', source: "tasks", enabled: true },
                    { title: "Status", accessor: 'status', source: "tasks", enabled: true },
                    
                    // annotations
                    { title: "ID", source: "annotations", enabled: true, canToggle: false },
                    { title: "Status", source: "annotations", enabled: true, canToggle: false },
                    { title: "Created On", source: "annotations", enabled: true },
                    { title: "Updated On", source: "annotations", enabled: true },
                    { title: "Author", source: "annotations", enabled: true },
                    { title: "Regions #", source: "annotations", enabled: true },
                    
                    // add some file fields
                ]
            }]
        }
    });
    
    return (
        <Provider store={app}>
          <Styles>
            <DmTabs />
          </Styles>
        </Provider>
    );
}

export default App;
