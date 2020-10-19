(this["webpackJsonphtx-frontend"] =
  this["webpackJsonphtx-frontend"] || []).push([
  [0],
  {
    137: function (e, t, n) {
      e.exports = n(193);
    },
    138: function (e) {
      e.exports = JSON.parse("{}");
    },
    193: function (e, t, n) {
      "use strict";
      n.r(t),
        n.d(t, "DataManager", function () {
          return Ae;
        });
      n(138);
      var a = n(81),
        r = n(82),
        o = n(49),
        i = n(57),
        l = n.n(i),
        c = n(83),
        s = (function () {
          function e(t) {
            var n;
            Object(a.a)(this, e),
              (this.gateway = null),
              (this.endpoints = new Map()),
              (this.commonHeaders = {}),
              (this.commonHeaders =
                null !== (n = t.commonHeaders) && void 0 !== n ? n : {}),
              (this.gateway = t.gateway),
              (this.endpoints = new Map(Object.entries(t.endpoints))),
              this.buildMethods();
          }
          return (
            Object(r.a)(e, [
              {
                key: "buildMethods",
                value: function () {
                  var e = this;
                  this.endpoints.forEach(function (t, n) {
                    e[n] = e.createApiCallExecutor(t);
                  });
                },
              },
              {
                key: "createApiCallExecutor",
                value: function (e) {
                  var t = this;
                  return (function () {
                    var n = Object(c.a)(
                      l.a.mark(function n(a) {
                        var r, o, i, c, s, u, d, m, f, p;
                        return l.a.wrap(
                          function (n) {
                            for (;;)
                              switch ((n.prev = n.next)) {
                                case 0:
                                  return (
                                    (n.prev = 0),
                                    (i = t.getSettings(e)),
                                    (c = (null !== (r = i.method) &&
                                    void 0 !== r
                                      ? r
                                      : "get"
                                    ).toUpperCase()),
                                    (s = t.createUrl(i.path, a.data)),
                                    (u = new Request({
                                      method: c,
                                      headers: Object.assign(
                                        {},
                                        null !== (o = i.headers) && void 0 !== o
                                          ? o
                                          : {}
                                      ),
                                    })),
                                    "GET" !== c &&
                                      (u.body = t.createRequestBody(a.body)),
                                    (n.next = 8),
                                    fetch(s, u)
                                  );
                                case 8:
                                  if (!(d = n.sent).ok) {
                                    n.next = 16;
                                    break;
                                  }
                                  return (n.next = 12), d.json();
                                case 12:
                                  return (
                                    (p = n.sent),
                                    n.abrupt(
                                      "return",
                                      null !==
                                        (m =
                                          null === (f = i.convert) ||
                                          void 0 === f
                                            ? void 0
                                            : f.call(i, p)) && void 0 !== m
                                        ? m
                                        : p
                                    )
                                  );
                                case 16:
                                  return n.abrupt("return", t.generateError(d));
                                case 17:
                                  n.next = 22;
                                  break;
                                case 19:
                                  return (
                                    (n.prev = 19),
                                    (n.t0 = n.catch(0)),
                                    n.abrupt(
                                      "return",
                                      t.generateException(n.t0)
                                    )
                                  );
                                case 22:
                                case "end":
                                  return n.stop();
                              }
                          },
                          n,
                          null,
                          [[0, 19]]
                        );
                      })
                    );
                    return function (e) {
                      return n.apply(this, arguments);
                    };
                  })();
                },
              },
              {
                key: "getSettings",
                value: function (e) {
                  return "string" === typeof e ? { path: e, method: "get" } : e;
                },
              },
              {
                key: "createUrl",
                value: function (e) {
                  var t =
                      arguments.length > 1 && void 0 !== arguments[1]
                        ? arguments[1]
                        : {},
                    n = new URL(this.gateway);
                  return (
                    (n.pathname = e),
                    t &&
                      "object" === typeof t &&
                      Object.entries(t).forEach(function (e) {
                        var t = Object(o.a)(e, 2),
                          a = t[0],
                          r = t[1];
                        n.searchParams.set(a, r);
                      }),
                    n.toString()
                  );
                },
              },
              {
                key: "createRequestBody",
                value: function (e) {
                  var t = new FormData();
                  return (
                    Object.entries(e).forEach(function (e) {
                      var n = Object(o.a)(e, 2),
                        a = n[0],
                        r = n[1];
                      t.append(a, r);
                    }),
                    t
                  );
                },
              },
              {
                key: "generateError",
                value: function (e) {
                  return { error: e.statusText };
                },
              },
              {
                key: "generateException",
                value: function (e) {
                  return console.error(e), { error: e.message };
                },
              },
            ]),
            e
          );
        })(),
        u = n(0),
        d = n.n(u),
        m = n(20),
        f = n.n(m),
        p = n(30),
        g = n(205),
        v = n(206),
        b = n(207),
        k = n(208),
        h = n(209),
        y = n(210),
        E = n(211),
        w = n(194),
        S = n(197),
        C = n(203),
        j = n(199),
        O = n(201),
        F = n(63),
        T = n(202),
        x = n(62),
        _ = n(204),
        R = n(78),
        D = n(198),
        L = n(195),
        A = n(112),
        I = R.a.Option;
      function H(e) {
        var t = e.column,
          n = t.filterValue,
          a = t._filterState,
          r = t.preFilteredRows,
          o = t.setFilter,
          i = r.length;
        return d.a.createElement(D.a, {
          allowClear: !0,
          style: { maxWidth: "300px" },
          value: n || a.stringValue || "",
          onChange: function (e) {
            a.update(e.target.value), o(e.target.value || void 0);
          },
          placeholder: "Search ".concat(i, " records..."),
        });
      }
      function P(e, t, n) {
        return Object(A.a)(e, n, {
          keys: [
            function (e) {
              return e.values[t];
            },
          ],
        });
      }
      function M(e, t, n) {
        return e.filter(function (e) {
          return e.values[t] >= n;
        });
      }
      (P.autoRemove = function (e) {
        return !e;
      }),
        (M.autoRemove = function (e) {
          return "number" !== typeof e;
        });
      var N = new Intl.DateTimeFormat(void 0, {
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
        V = {
          id: {
            title: "ID",
            accessor: "id",
            filterClass: function (e) {
              var t = e.column,
                n = t.filterValue,
                a = t._filterState,
                r = t.setFilter,
                i = t.preFilteredRows,
                l = t.id,
                c = d.a.useMemo(
                  function () {
                    var e = i.length ? i[0].values[l] : 0,
                      t = i.length ? i[0].values[l] : 0;
                    return (
                      i.forEach(function (n) {
                        (e = Math.min(n.values[l], e)),
                          (t = Math.max(n.values[l], t));
                      }),
                      [e, t]
                    );
                  },
                  [l, i]
                ),
                s = Object(o.a)(c, 2),
                u = s[0],
                m = s[1];
              return d.a.createElement(
                "div",
                { style: { display: "flex", width: "100%" } },
                d.a.createElement(L.a, {
                  style: { flex: "auto 1 0" },
                  min: u,
                  max: m,
                  value: n || a.value || u,
                  onChange: function (e) {
                    var t = parseInt(e, 10);
                    a.update(t), r(t);
                  },
                }),
                d.a.createElement(F.a, {
                  type: "text",
                  icon: d.a.createElement(_.a, null),
                  onClick: function () {
                    a.update(u), r(u);
                  },
                })
              );
            },
            filterType: M,
          },
          task_status: {
            id: "status",
            title: "Status",
            accessor: function () {
              return "";
            },
            filterClass: function (e) {
              var t = e.column,
                n = t.filterValue,
                a = t._filterState,
                r = t.setFilter,
                o = t.preFilteredRows,
                i = t.id,
                l = d.a.useMemo(
                  function () {
                    var e = new Set();
                    return (
                      o.forEach(function (t) {
                        e.add(t.values[i]);
                      }),
                      Object(x.a)(e.values())
                    );
                  },
                  [i, o]
                );
              return d.a.createElement(
                R.a,
                {
                  style: { width: "100%", maxWidth: "300px" },
                  value: n || a.stringValue,
                  onChange: function (e) {
                    a.update(e), r(e || void 0);
                  },
                },
                d.a.createElement(I, { value: "" }, "All"),
                l.map(function (e, t) {
                  return d.a.createElement(I, { key: t, value: e }, e);
                })
              );
            },
            filterType: "includes",
          },
          annotations: {
            id: "annotations",
            title: "Annotations",
            accessor: function (e) {
              return e.completions
                ? e.completions.length + e.predictions.length
                : 0;
            },
            Cell: function (e) {
              var t = e.row.original;
              return t.completions
                ? ""
                    .concat(t.completions.length, " / ")
                    .concat(t.predictions.length)
                : "";
            },
          },
          annotation_id: { title: "ID", accessor: "annotation_id" },
          task_id: { title: "Task", accessor: "task_id" },
          annotation_status: { title: "Status" },
          author: { title: "Author" },
          regions: { title: "Regions #", accessor: "result.length" },
          created: {
            title: "Created On",
            accessor: "created_at",
            Cell: function (e) {
              var t = e.value;
              return N.format(new Date(t));
            },
          },
          updated: { title: "Updated On" },
        },
        B = ["id", "task_status"];
      var G = function (e) {
          return e in V
            ? V[e]
            : {
                id: e,
                title: e,
                accessor: function (t) {
                  return t.data[e];
                },
                filterClass: H,
                filterType: P,
              };
        },
        z = Object(p.c)(function (e) {
          var t = e.item,
            n =
              (e.store,
              function (e) {
                return d.a.createElement(
                  S.a.Item,
                  {
                    key: e.source + e.field,
                    onClick: e.toggle,
                    className: "fields-menu-item",
                  },
                  G(e.field).title,
                  e.canToggle
                    ? d.a.createElement(T.a, {
                        checked: e.enabled,
                        size: "small",
                      })
                    : null
                );
              });
          return d.a.createElement(
            S.a,
            { size: "small", onClick: function () {} },
            "tasks" === t.target &&
              d.a.createElement(
                S.a.ItemGroup,
                { title: "Tasks" },
                t.fieldsSource("tasks").map(n)
              ),
            "annotations" === t.target &&
              d.a.createElement(
                S.a.ItemGroup,
                { title: "Annotations" },
                t.fieldsSource("annotations").map(n)
              ),
            d.a.createElement(
              S.a.ItemGroup,
              { title: "Input" },
              t.fieldsSource("inputs").map(n)
            ),
            d.a.createElement(
              S.a.ItemGroup,
              { title: "v2: Results" },
              d.a.createElement(S.a.Item, { key: "5" }, "class")
            )
          );
        }),
        U = n(71),
        J = n(135),
        K = n(196),
        q = n(72),
        W = d.a.forwardRef(function (e, t) {
          var n = e.indeterminate,
            a = Object(J.a)(e, ["indeterminate"]),
            r = d.a.useRef(),
            o = t || r;
          return (
            d.a.useEffect(
              function () {
                o.current.indeterminate = n;
              },
              [o, n]
            ),
            d.a.createElement(
              d.a.Fragment,
              null,
              d.a.createElement(
                "input",
                Object.assign({ type: "checkbox", ref: o }, a)
              )
            )
          );
        }),
        X = Object(p.c)(function (e) {
          var t = e.columns,
            n = e.data,
            a = e.item,
            r = e.onSelectRow,
            o =
              (d.a.useMemo(function () {
                return {
                  fuzzyText: P,
                  text: function (e, t, n) {
                    return e.filter(function (e) {
                      var a = e.values[t];
                      return (
                        void 0 === a ||
                        String(a)
                          .toLowerCase()
                          .startsWith(String(n).toLowerCase())
                      );
                    });
                  },
                };
              }, []),
              Object(q.useTable)(
                {
                  columns: t,
                  data: n,
                  initialState: {
                    pageSize: 20,
                    hiddenColumns: "dm" === a.root.mode ? [] : a.dataFields,
                    filters: t
                      .filter(function (e) {
                        return e._filterState;
                      })
                      .map(function (e) {
                        return {
                          id: e.id || e.accessor,
                          value: e._filterState.value,
                        };
                      }),
                    sortBy: [{ id: "id", desc: !1 }],
                  },
                },
                q.useFilters,
                q.useSortBy,
                q.usePagination,
                q.useRowSelect,
                function (e) {
                  e.visibleColumns.push(function (e) {
                    return [
                      Object(U.a)(
                        Object(U.a)({}, e[0]),
                        {},
                        {
                          Header: function (e) {
                            var t = e.getToggleAllRowsSelectedProps;
                            return d.a.createElement(
                              "div",
                              null,
                              "dm" === a.root.mode
                                ? d.a.createElement(W, t())
                                : null,
                              " ID"
                            );
                          },
                          Cell: function (e) {
                            var t = e.row,
                              n = e.value;
                            return d.a.createElement(
                              "div",
                              null,
                              "dm" === a.root.mode
                                ? d.a.createElement(
                                    d.a.Fragment,
                                    null,
                                    d.a.createElement(
                                      W,
                                      t.getToggleRowSelectedProps()
                                    ),
                                    " ",
                                    n
                                  )
                                : d.a.createElement(
                                    "span",
                                    {
                                      style: { cursor: "pointer" },
                                      onClick: function () {
                                        return r && r(t.original);
                                      },
                                    },
                                    n
                                  )
                            );
                          },
                        }
                      ),
                    ].concat(Object(x.a)(e.slice(1)));
                  });
                }
              )),
            i = o.getTableProps,
            l = o.getTableBodyProps,
            c = o.headerGroups,
            s = o.page,
            u = o.prepareRow,
            m =
              (o.state,
              o.visibleColumns,
              o.selectedFlatRows,
              o.preGlobalFilteredRows,
              o.setGlobalFilter,
              o.state.selectedRowIds),
            f = o.gotoPage,
            p = o.setPageSize,
            g = o.pageCount,
            v = o.state,
            b = v.pageIndex,
            k = v.pageSize,
            h = function () {
              return d.a.createElement(
                d.a.Fragment,
                null,
                d.a.createElement(
                  "table",
                  Object.assign({}, i(), { style: { width: "100%" } }),
                  d.a.createElement(
                    "thead",
                    null,
                    c.map(function (e) {
                      return d.a.createElement(
                        "tr",
                        e.getHeaderGroupProps(),
                        e.headers.map(function (e) {
                          return d.a.createElement(
                            "th",
                            e.getHeaderProps(),
                            e.render("Header"),
                            d.a.createElement(
                              "div",
                              null,
                              e.canFilter && "dm" === a.root.mode
                                ? e.render("Filter")
                                : null
                            )
                          );
                        })
                      );
                    })
                  ),
                  d.a.createElement(
                    "tbody",
                    l(),
                    s.map(function (e, t) {
                      return (
                        u(e),
                        d.a.createElement(
                          "tr",
                          e.getRowProps(),
                          e.cells.map(function (e) {
                            return d.a.createElement(
                              "td",
                              e.getCellProps(),
                              e.render("Cell")
                            );
                          })
                        )
                      );
                    })
                  )
                ),
                d.a.createElement(K.a, {
                  current: b,
                  total: g * k,
                  pageSize: k,
                  onChange: function (e, t) {
                    f(e), p(t);
                  },
                }),
                d.a.createElement(
                  "p",
                  null,
                  "Selected Completions: ",
                  Object.keys(m).length
                )
              );
            };
          return "dm" === a.root.mode
            ? "list" === a.type
              ? h()
              : d.a.createElement(
                  d.a.Fragment,
                  null,
                  !0 === a.enableFilters
                    ? d.a.createElement(
                        "div",
                        null,
                        c.map(function (e) {
                          return d.a.createElement(
                            "div",
                            Object.assign({}, e.getHeaderGroupProps(), {
                              style: { background: "#ccc" },
                            }),
                            e.headers.map(function (e) {
                              return d.a.createElement(
                                "div",
                                e.getHeaderProps(),
                                e.render("Header"),
                                d.a.createElement(
                                  "div",
                                  null,
                                  e.canFilter ? e.render("Filter") : null
                                )
                              );
                            })
                          );
                        })
                      )
                    : null,
                  d.a.createElement(
                    "div",
                    { className: "grid" },
                    s.map(function (e, t) {
                      return (
                        u(e),
                        d.a.createElement(
                          "div",
                          e.getRowProps(),
                          e.cells.map(function (e) {
                            return d.a.createElement(
                              "div",
                              e.getCellProps(),
                              e.render("Cell")
                            );
                          })
                        )
                      );
                    })
                  )
                )
            : h();
        }),
        Z = w.a.TabPane,
        Q = d.a.createElement(
          S.a,
          { onClick: function () {} },
          d.a.createElement(S.a.Item, { key: "1" }, "Delete")
        ),
        Y = Object(p.c)(function (e) {
          var t = e.item;
          return d.a.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1em",
                marginBottom: "1em",
              },
            },
            d.a.createElement(
              C.b,
              { size: "middle" },
              d.a.createElement(
                j.a.Group,
                {
                  value: t.type,
                  onChange: function (e) {
                    return t.setType(e.target.value);
                  },
                },
                d.a.createElement(
                  j.a.Button,
                  { value: "list" },
                  d.a.createElement(g.a, null),
                  " List"
                ),
                d.a.createElement(
                  j.a.Button,
                  { value: "grid" },
                  d.a.createElement(v.a, null),
                  " Grid"
                )
              ),
              d.a.createElement(
                j.a.Group,
                {
                  value: t.target,
                  onChange: function (e) {
                    return t.setTarget(e.target.value);
                  },
                },
                d.a.createElement(j.a.Button, { value: "tasks" }, "Tasks"),
                d.a.createElement(
                  j.a.Button,
                  { value: "annotations" },
                  "Annotations"
                )
              ),
              d.a.createElement(
                O.a,
                { overlay: d.a.createElement(z, { item: t }) },
                d.a.createElement(
                  F.a,
                  null,
                  d.a.createElement(b.a, null),
                  " Fields ",
                  d.a.createElement(k.a, null)
                )
              ),
              d.a.createElement(
                F.a,
                {
                  type: t.enableFilters ? "primary" : "",
                  onClick: function () {
                    return t.toggleFilters();
                  },
                },
                d.a.createElement(h.a, null),
                " Filters",
                " "
              )
            ),
            d.a.createElement(
              C.b,
              { size: "middle" },
              d.a.createElement(
                F.a,
                {
                  disabled: "annotations" === t.target,
                  onClick: function () {
                    return t.root.setMode("label");
                  },
                },
                d.a.createElement(y.a, null),
                "Label All"
              ),
              d.a.createElement(
                O.a,
                { overlay: Q },
                d.a.createElement(
                  F.a,
                  null,
                  "Actions ",
                  d.a.createElement(k.a, null)
                )
              )
            )
          );
        }),
        $ = Object(p.c)(function (e) {
          var t = e.item;
          return d.a.createElement(
            S.a,
            null,
            d.a.createElement(
              S.a.Item,
              { key: "0" },
              d.a.createElement(
                "a",
                {
                  href: "#rename",
                  onClick: function (e) {
                    return e.preventDefault(), t.setRenameMode(!0), !1;
                  },
                },
                "Rename"
              )
            ),
            d.a.createElement(
              S.a.Item,
              { key: "1" },
              d.a.createElement(
                "a",
                {
                  href: "#duplicate",
                  onClick: function (e) {
                    return e.preventDefault(), t.parent.duplicateView(t), !1;
                  },
                },
                "Duplicate"
              )
            ),
            d.a.createElement(S.a.Divider, null),
            t.parent.canClose
              ? d.a.createElement(
                  S.a.Item,
                  {
                    key: "2",
                    onClick: function () {
                      t.parent.deleteView(t);
                    },
                  },
                  "Close"
                )
              : null
          );
        }),
        ee = Object(p.c)(function (e) {
          var t = e.item;
          return d.a.createElement(
            "span",
            null,
            t.renameMode
              ? d.a.createElement("input", {
                  type: "text",
                  value: t.title,
                  onKeyPress: function (e) {
                    "Enter" !== e.key || t.setRenameMode(!1);
                  },
                  onChange: function (e) {
                    t.setTitle(e.target.value);
                  },
                })
              : t.title,
            "\xa0\xa0\xa0\xa0",
            d.a.createElement(
              O.a,
              {
                overlay: d.a.createElement($, { item: t }),
                trigger: ["click"],
              },
              d.a.createElement(
                "a",
                {
                  href: "#down",
                  className: "ant-dropdown-link",
                  onClick: function (e) {
                    return e.preventDefault();
                  },
                },
                d.a.createElement(E.a, null)
              )
            )
          );
        }),
        te = Object(p.b)("store")(
          Object(p.c)(function (e) {
            var t = e.item,
              n = e.store,
              a = t.fieldsAsColumns,
              r =
                "annotations" === n.viewsStore.selected.target
                  ? n.tasksStore.getAnnotationData()
                  : n.tasksStore.getData(),
              i = d.a.useState(!1),
              l = Object(o.a)(i, 2),
              c = l[0];
            l[1];
            return d.a.createElement(
              "div",
              null,
              d.a.createElement(Y, { item: t }),
              d.a.createElement(X, {
                columns: a,
                data: r,
                item: t,
                skipPageReset: c,
              })
            );
          })
        ),
        ne = Object(p.b)("store")(
          Object(p.c)(function (e) {
            var t = e.store;
            return d.a.createElement(
              w.a,
              {
                onChange: function (e) {
                  t.viewsStore.setSelected(e);
                },
                activeKey: t.viewsStore.selected.key,
                type: "editable-card",
                onEdit: t.viewsStore.addView,
              },
              t.viewsStore.all.map(function (e) {
                return d.a.createElement(
                  Z,
                  {
                    tab: d.a.createElement(ee, { item: e }),
                    key: e.key,
                    closable: !1,
                  },
                  d.a.createElement(te, { item: e })
                );
              })
            );
          })
        ),
        ae = n(102),
        re = "api",
        oe = "/tasks",
        ie = "/completions",
        le = "/cancel",
        ce = "/projects",
        se = "/next/",
        ue = (function (e) {
          var t = function (e) {
              return 200 !== e.status || 201 !== e.status ? e : e.json();
            },
            n = function (n, a, r, o) {
              return e
                .fetch(n, {
                  method: a,
                  headers: r,
                  credentials: "include",
                  body: o,
                })
                .then(function (e) {
                  return t(e);
                });
            };
          return {
            fetcher: function (e) {
              return n(e, "GET", { Accept: "application/json" });
            },
            poster: function (e, t) {
              return n(
                e,
                "POST",
                {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                t
              );
            },
            patch: function (e, t) {
              return n(
                e,
                "PATCH",
                {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                t
              );
            },
            remover: function (e, t) {
              return n(e, "DELETE", { "Content-Type": "application/json" }, t);
            },
          };
        })(window),
        de = function (e, t, n) {
          try {
            ue.fetcher(t).then(function (t) {
              t instanceof Response && 404 === t.status
                ? e.setFlags({ isLoading: !1, noTask: !0 })
                : t instanceof Response && 403 === t.status
                ? e.setFlags({ isLoading: !1, noAccess: !0 })
                : t.json().then(function (t) {
                    (t.data = JSON.stringify(t.data)),
                      e.resetState(),
                      e.assignTask(t),
                      e.initializeStore(pe(t));
                    var a,
                      r = e.completionStore;
                    (a =
                      r.predictions.length > 0
                        ? e.completionStore.addCompletionFromPrediction(
                            r.predictions[0]
                          )
                        : e.completionStore.completions.length > 0 && n
                        ? { id: n }
                        : e.completionStore.addCompletion({ userGenerate: !0 }))
                      .id && r.selectCompletion(a.id),
                      e.setFlags({ isLoading: !1 }),
                      e.onTaskLoad(e, e.task);
                  });
            });
          } catch (a) {
            console.error("Failed to load next task ", a);
          }
        },
        me = function (e) {
          var t = "".concat(re).concat(ce, "/1").concat(se);
          return de(e, t);
        },
        fe = function (e, t, n) {
          var a = "".concat(re).concat(oe, "/").concat(t);
          return de(e, a, n);
        },
        pe = function (e) {
          if (e) {
            if (e.completions) {
              var t,
                n = Object(ae.a)(e.completions);
              try {
                for (n.s(); !(t = n.n()).done; ) {
                  var a = t.value;
                  (a.pk = a.id),
                    (a.createdAgo = a.created_ago),
                    (a.createdBy = a.created_username),
                    (a.leadTime = a.lead_time);
                }
              } catch (l) {
                n.e(l);
              } finally {
                n.f();
              }
            }
            if (e.predictions) {
              var r,
                o = Object(ae.a)(e.predictions);
              try {
                for (o.s(); !(r = o.n()).done; ) {
                  var i = r.value;
                  (i.pk = i.pk),
                    (i.createdAgo = i.created_ago),
                    (i.createdBy = i.created_by);
                }
              } catch (l) {
                o.e(l);
              } finally {
                o.f();
              }
            }
            return e;
          }
        },
        ge = { pk: 1, firstName: "James", lastName: "Dean" },
        ve = [
          "panel",
          "update",
          "controls",
          "side-column",
          "completions:menu",
          "completions:add-new",
          "completions:delete",
          "predictions:menu",
        ],
        be = Object(p.b)("store")(
          Object(p.c)(function (e) {
            var t = e.store,
              n = t.viewsStore.selected,
              a = n.fieldsAsColumns,
              r = t.tasksStore.getData(),
              o = t._config,
              i =
                "dev" === t._mode
                  ? d.a.useCallback(
                      function (e) {
                        if ((t.tasksStore.setTask(e), !window.LabelStudio))
                          return setTimeout(function () {
                            return i(e);
                          }, 100);
                        new window.LabelStudio("label-studio", {
                          config: o,
                          interfaces: ve,
                          user: ge,
                          task: e,
                        });
                      },
                      [o, i, t.tasksStore]
                    )
                  : d.a.useCallback(function (e) {
                      t.tasksStore.setTask(e),
                        (function (e, t, n, a) {
                          var r = function (e) {
                              for (
                                var t = arguments.length,
                                  n = new Array(t > 1 ? t - 1 : 0),
                                  r = 1;
                                r < t;
                                r++
                              )
                                n[r - 1] = arguments[r];
                              if (e in a) return a[e].apply(null, n);
                            },
                            o = function (e, t) {
                              var n = {
                                lead_time: (new Date() - e.loadedDate) / 1e3,
                                result: e.serializeCompletion(),
                              };
                              return (
                                t && (n.id = parseInt(e.id)), JSON.stringify(n)
                              );
                            };
                          function i(e, t, n) {
                            e.taskHistoryIds.push({
                              task_id: t,
                              completion_id: n,
                            }),
                              (e.taskHistoryCurrent = e.taskHistoryIds.length);
                          }
                          var l = new window.LabelStudio(e, {
                              config: t,
                              user: {
                                pk: 1,
                                firstName: "Awesome",
                                lastName: "User",
                              },
                              task: pe(n),
                              interfaces: [
                                "basic",
                                "panel",
                                "controls",
                                "submit",
                                "update",
                                "predictions",
                                "predictions:menu",
                                "completions:menu",
                                "completions:add-new",
                                "completions:delete",
                                "side-column",
                                "skip",
                              ],
                              onSubmitCompletion: function (e, t) {
                                return (
                                  e.setFlags({ isLoading: !0 }),
                                  ue
                                    .poster(
                                      ""
                                        .concat(re)
                                        .concat(oe, "/")
                                        .concat(e.task.id)
                                        .concat(ie, "/"),
                                      o(t)
                                    )
                                    .then(function (a) {
                                      a.json().then(function (a) {
                                        a &&
                                          a.id &&
                                          (t.updatePersonalKey(a.id.toString()),
                                          r(
                                            "onSubmitCompletion",
                                            e,
                                            (function (e) {
                                              if (e)
                                                return {
                                                  id: e.pk,
                                                  created_ago: e.createdAgo,
                                                  created_username: e.createdBy,
                                                  created_at:
                                                    "2019-08-06T19:27:29.289566Z",
                                                  lead_time: e.leadTime,
                                                };
                                            })(t),
                                            a
                                          ),
                                          i(e, e.task.id, a.id)),
                                          n
                                            ? e.setFlags({ isLoading: !1 })
                                            : me(e);
                                      });
                                    }),
                                  !0
                                );
                              },
                              onTaskLoad: function (e) {},
                              onUpdateCompletion: function (e, t) {
                                e.setFlags({ isLoading: !0 }),
                                  ue
                                    .patch(
                                      ""
                                        .concat(re)
                                        .concat(oe, "/")
                                        .concat(e.task.id)
                                        .concat(ie, "/")
                                        .concat(t.pk, "/"),
                                      o(t)
                                    )
                                    .then(function (n) {
                                      e.setFlags({ isLoading: !1 }),
                                        n.json().then(function (n) {
                                          r("onUpdateCompletion", e, t, n);
                                        }),
                                        fe(
                                          e,
                                          e.task.id,
                                          e.completionStore.selected.id
                                        );
                                    });
                              },
                              onDeleteCompletion: function (e, t) {
                                e.setFlags({ isLoading: !0 }),
                                  ue
                                    .remover(
                                      ""
                                        .concat(re)
                                        .concat(oe, "/")
                                        .concat(e.task.id)
                                        .concat(ie, "/")
                                        .concat(t.pk, "/")
                                    )
                                    .then(function (n) {
                                      r("onDeleteCompletion", e, t),
                                        e.setFlags({ isLoading: !1 });
                                    });
                              },
                              onSkipTask: function (e) {
                                e.setFlags({ loading: !0 });
                                var t = e.completionStore.selected,
                                  a = o(t, !0);
                                return (
                                  ue
                                    .poster(
                                      ""
                                        .concat(re)
                                        .concat(oe, "/")
                                        .concat(e.task.id)
                                        .concat(le),
                                      a
                                    )
                                    .then(function (a) {
                                      a.json().then(function (a) {
                                        a &&
                                          a.id &&
                                          (t.updatePersonalKey(a.id.toString()),
                                          i(e, e.task.id, a.id)),
                                          n
                                            ? (e.setFlags({ isLoading: !1 }),
                                              fe(e, e.task.id, a.id))
                                            : me(e);
                                      });
                                    }),
                                  r("onDeleteCompletion", e, t),
                                  !0
                                );
                              },
                              onGroundTruth: function (e, t, n) {
                                ue.patch(
                                  ""
                                    .concat(re)
                                    .concat(oe, "/")
                                    .concat(e.task.id)
                                    .concat(ie, "/")
                                    .concat(t.pk, "/"),
                                  JSON.stringify({ honeypot: n })
                                );
                              },
                              onLabelStudioLoad: function (e) {
                                if (
                                  ((e.onTaskLoad = this.onTaskLoad),
                                  (e.onPrevButton = this.onPrevButton),
                                  (function (e) {
                                    e.taskHistoryIds ||
                                      ((e.taskHistoryIds = []),
                                      (e.taskHistoryCurrent = -1));
                                  })(e),
                                  n)
                                ) {
                                  if (
                                    !n ||
                                    !n.completions ||
                                    0 === n.completions.length
                                  ) {
                                    var t = e.completionStore.addCompletion({
                                      userGenerate: !0,
                                    });
                                    e.completionStore.selectCompletion(t.id);
                                  }
                                } else e.setFlags({ isLoading: !0 }), me(e);
                              },
                            }),
                            c = {
                              loadNext: function () {
                                me(l);
                              },
                              loadTask: function (e) {
                                fe(l, e);
                              },
                              prevButtonClick: function () {
                                l.taskHistoryCurrent--;
                                var e = l.taskHistoryIds[l.taskHistoryCurrent];
                                fe(l, e.task_id, e.completion_id);
                              },
                              nextButtonClick: function () {
                                if (
                                  (l.taskHistoryCurrent++,
                                  l.taskHistoryCurrent <
                                    l.taskHistoryIds.length)
                                ) {
                                  var e =
                                    l.taskHistoryIds[l.taskHistoryCurrent];
                                  fe(l, e.task_id, e.completion_id);
                                } else me(l);
                              },
                            };
                          l._sdk = c;
                        })(
                          "label-studio",
                          o,
                          e,
                          t.tasksStore.buildLSFCallbacks()
                        );
                    });
            return (
              d.a.useEffect(
                function () {
                  return i(r[0]);
                },
                [r, i]
              ),
              d.a.createElement(
                "div",
                null,
                d.a.createElement("link", {
                  href:
                    "https://unpkg.com/label-studio@0.7.3/build/static/css/main.09b8161e.css",
                  rel: "stylesheet",
                }),
                d.a.createElement(
                  F.a,
                  {
                    onClick: function () {
                      return t.setMode("dm");
                    },
                  },
                  "Back to Table"
                ),
                d.a.createElement(
                  "div",
                  { style: { display: "flex" } },
                  d.a.createElement(
                    "div",
                    { style: { flex: "200px 0 0", marginRight: "1em" } },
                    d.a.createElement(X, {
                      columns: a,
                      data: r,
                      item: n,
                      onSelectRow: i,
                    })
                  ),
                  d.a.createElement(
                    "div",
                    { style: { width: "100%" } },
                    d.a.createElement("div", { id: "label-studio" })
                  )
                )
              )
            );
          })
        ),
        ke = n(128);
      function he() {
        var e = Object(ke.a)([
          "\n  padding: 1rem;\n\n  .grid {\n    display: flex;\n  }\n\n  .grid > div {\n    border: 1px solid #ccc;\n    border-radius: 5px;\n    padding: 1em;\n  }\n\n  .grid {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);\n    grid-gap: 1em;\n  }\n\n  table {\n    border-spacing: 0;\n    border: none;\n    margin-bottom: 1em;\n\n    thead {\n      background: #fafafa;\n    }\n\n    tr {\n      :hover td {\n        background: #fafafa;\n      }\n    }\n\n    th,\n    td {\n      margin: 0;\n      padding: 0.5rem;\n      border-bottom: 1px solid #f0f0f0;\n\n      vertical-align: top;\n\n      .resizer {\n        display: inline-block;\n        background: blue;\n        width: 10px;\n        height: 100%;\n        position: absolute;\n        right: 0;\n        top: 0;\n        transform: translateX(50%);\n        z-index: 1;\n        ",
          "\n        touch-action:none;\n\n        &.isResizing {\n          background: red;\n        }\n      }\n    }\n  }\n",
        ]);
        return (
          (he = function () {
            return e;
          }),
          e
        );
      }
      var ye = n(129).a.div(he(), ""),
        Ee = Object(p.c)(function (e) {
          var t = e.app;
          return d.a.createElement(
            p.a,
            { store: t },
            d.a.createElement(
              ye,
              null,
              "dm" === t.mode
                ? d.a.createElement(ne, null)
                : d.a.createElement(be, null)
            )
          );
        }),
        we = n(12),
        Se = n(103);
      function Ce(e) {
        var t = Object(Se.a)(10);
        return e && (t = Object(Se.a)(e)), t;
      }
      var je = we.e
          .model("StringFilter", { stringValue: we.e.string })
          .views(function (e) {
            return {
              get value() {
                return e.stringValue;
              },
            };
          })
          .actions(function (e) {
            return {
              update(t) {
                e.stringValue = t;
              },
            };
          }),
        Oe = we.e
          .model("NumberFilter", { numValue: we.e.number })
          .views(function (e) {
            return {
              get value() {
                return e.numValue;
              },
            };
          })
          .actions(function (e) {
            return {
              update(t) {
                e.numValue = t;
              },
            };
          }),
        Fe = we.e
          .model("BetweenNumberFilter", {
            startNum: we.e.number,
            endNum: we.e.number,
          })
          .views(function (e) {
            return {
              get value() {
                return [e.startNum, e.endNum];
              },
            };
          })
          .actions(function (e) {
            return {
              update(t) {
                var n = Object(o.a)(t, 2),
                  a = n[0],
                  r = n[1];
                null !== a && (e.startNum = a), null !== r && (e.endNum = r);
              },
            };
          }),
        Te = we.e
          .model("TasksStore", {})
          .views(function (e) {
            return {
              buildLSFCallbacks: () => ({
                onSubmitCompletion: function (t, n, a) {
                  var r = e.getTask();
                  r &&
                    ("completions" in r
                      ? r.completions.push(n)
                      : (r.completions = [n]));
                },
                onTaskLoad: function (e) {},
                onUpdateCompletion: function (e, t) {},
                onDeleteCompletion: function (t, n) {
                  var a = e.getTask();
                  if (a && a.completions) {
                    var r = a.completions.findIndex(function (e) {
                      return e.id === n.id;
                    });
                    a.completions.splice(r, 1);
                  }
                },
                onSkipTask: function (e) {},
                onLabelStudioLoad: function (e) {},
              }),
            };
          })
          .actions(function (e) {
            var t = [],
              n = null;
            return {
              setData: function (e) {
                t = e;
              },
              getData: function () {
                return t;
              },
              getDataFields: function () {
                return Object.keys(t[0].data || {});
              },
              getAnnotationData: function () {
                return t
                  .map(function (e) {
                    return e.completions
                      ? e.completions.map(function (t) {
                          return (
                            (t.annotation_id = t.id),
                            (t.task_id = e.id),
                            (t.data = e.data),
                            t
                          );
                        })
                      : [];
                  })
                  .flat();
              },
              setTask: function (e) {
                n = e;
              },
              getTask: function () {
                return n;
              },
            };
          }),
        xe = we.e
          .model("Fields", {
            field: we.e.string,
            enabled: !0,
            canToggle: !1,
            source: we.e.optional(
              we.e.enumeration(["tasks", "annotations", "inputs"]),
              "tasks"
            ),
            filterState: we.e.maybeNull(we.e.union({ eager: !1 }, je, Oe, Fe)),
          })
          .views(function (e) {
            return {
              get key() {
                return e.source + "_" + e.field;
              },
            };
          })
          .actions(function (e) {
            return {
              toggle() {
                e.enabled = !e.enabled;
              },
            };
          }),
        _e = we.e
          .model("View", {
            id: we.e.optional(we.e.identifier, function () {
              return Ce(5);
            }),
            title: "Tasks",
            type: we.e.optional(we.e.enumeration(["list", "grid"]), "list"),
            target: we.e.optional(
              we.e.enumeration(["tasks", "annotations"]),
              "tasks"
            ),
            fields: we.e.array(xe),
            enableFilters: !1,
            renameMode: !1,
          })
          .views(function (e) {
            return {
              get key() {
                return e.id;
              },
              get root() {
                return Object(we.c)(e);
              },
              get parent() {
                return Object(we.b)(Object(we.b)(e));
              },
              get dataFields() {
                return e.fields
                  .filter(function (e) {
                    return "inputs" === e.source;
                  })
                  .map(function (e) {
                    return e.field;
                  });
              },
              get hasDataFields() {
                return e.dataFields.length > 0;
              },
              fieldsSource: (t) =>
                e.fields.filter(function (e) {
                  return e.source === t;
                }),
              get fieldsAsColumns() {
                return ("tasks" === e.target
                  ? e.fields.filter(function (e) {
                      return "annotations" !== e.source;
                    })
                  : e.fields.filter(function (e) {
                      return "tasks" !== e.source;
                    })
                )
                  .filter(function (t) {
                    return (
                      t.enabled &&
                      ("label" !== e.root.mode ||
                        B.includes(t.field) ||
                        "inputs" === t.source)
                    );
                  })
                  .map(function (t) {
                    var n = G(t.field),
                      a = n.id,
                      r = n.accessor,
                      o = n.Cell,
                      i = n.filterClass,
                      l = n.filterType,
                      c = {
                        Header: n.title,
                        accessor: r,
                        disableFilters: !0,
                        _filterState: t.filterState,
                      };
                    return (
                      o && (c.Cell = o),
                      a && (c.id = a),
                      !0 === e.enableFilters &&
                        (void 0 !== i && (c.Filter = i),
                        void 0 !== l && (c.filter = l),
                        (l || i) && (c.disableFilters = !1)),
                      c
                    );
                  });
              },
            };
          })
          .actions(function (e) {
            return {
              setType(t) {
                e.type = t;
              },
              setTarget(t) {
                e.target = t;
              },
              setTitle(t) {
                e.title = t;
              },
              setRenameMode(t) {
                e.renameMode = t;
              },
              toggleFilters() {
                e.enableFilters = !e.enableFilters;
              },
              afterAttach() {
                if (!e.hasDataFields) {
                  var t = e.root.tasksStore.getDataFields();
                  e.fields = [].concat(
                    Object(x.a)(e.fields),
                    Object(x.a)(
                      t.map(function (e) {
                        return xe.create({
                          field: e,
                          canToggle: !0,
                          enabled: !1,
                          source: "inputs",
                          filterState: { stringValue: "" },
                        });
                      })
                    )
                  );
                }
              },
            };
          }),
        Re = we.e
          .model("ViewsStore", {
            selected: we.e.safeReference(_e),
            views: we.e.array(_e),
          })
          .views(function (e) {
            return {
              get all() {
                return e.views;
              },
              get canClose() {
                return e.all.length > 1;
              },
            };
          })
          .actions(function (e) {
            return {
              setSelected(t) {
                e.selected = t;
              },
              deleteView(t) {
                var n = !1;
                e.selected === t && (n = !0),
                  Object(we.a)(t),
                  n && e.setSelected(e.views[0]);
              },
              addView() {
                var t = Object(we.d)(e.views[0]),
                  n = _e.create({ fields: t.fields });
                return e.views.push(n), e.setSelected(n), n;
              },
              duplicateView(t) {
                var n = Object(we.d)(t),
                  a = _e.create(
                    Object(U.a)(
                      Object(U.a)({}, n),
                      {},
                      { id: Ce(5), title: n.title + " copy" }
                    )
                  );
                e.views.push(a), e.setSelected(e.views[e.views.length - 1]);
              },
              afterCreate() {
                e.selected || e.setSelected(e.views[0]);
              },
            };
          }),
        De = we.e
          .model("dmAppStore", {
            mode: we.e.optional(we.e.enumeration(["dm", "label"]), "dm"),
            tasksStore: we.e.optional(Te, {}),
            viewsStore: we.e.optional(Re, { views: [] }),
          })
          .actions(function (e) {
            return {
              setMode(t) {
                e.mode = t;
              },
            };
          }),
        Le = (function () {
          function e(t) {
            Object(a.a)(this, e),
              (this.root = null),
              (this.api = null),
              (this.lsf = null),
              (this.dataManager = null),
              (this.root = t.root),
              (this.api = new s(t.api)),
              this.initApp();
          }
          return (
            Object(r.a)(e, [
              {
                key: "initApp",
                value: function () {
                  this.dataManager = (function (e) {
                    var t =
                        arguments.length > 1 && void 0 !== arguments[1]
                          ? arguments[1]
                          : {},
                      n = De.create({ viewsStore: { views: t.views } });
                    n.tasksStore.setData(t.data),
                      (n._config = t.config),
                      (n._mode = t.mode || "production"),
                      (window.DM = n);
                    var a = f.a.render(d.a.createElement(Ee, { app: n }), e);
                    return { appStore: n, component: a };
                  })(this.root, this.api);
                },
              },
            ]),
            e
          );
        })(),
        Ae = function (e) {
          return new Le(e);
        };
    },
  },
  [[137, 1, 2]],
]);
//# sourceMappingURL=main.1273d615.chunk.js.map
