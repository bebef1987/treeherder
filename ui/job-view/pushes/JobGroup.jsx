import React from 'react';
import PropTypes from 'prop-types';
import countBy from 'lodash/countBy';

import { withSelectedJob } from '../context/SelectedJob';
import { thFailureResults } from '../../helpers/constants';
import { getBtnClass, getStatus } from '../../helpers/job';
import { getUrlParam } from '../../helpers/location';
import JobButton from './JobButton';
import JobCount from './JobCount';

class GroupSymbol extends React.PureComponent {
  render() {
    const { symbol, tier, toggleExpanded } = this.props;

    return (
      <button
        className="btn group-symbol"
        onClick={toggleExpanded}
      >{symbol}{tier !== 1 && <span className="small text-muted">[tier {tier}]</span>}
      </button>
    );
  }
}

GroupSymbol.propTypes = {
  symbol: PropTypes.string.isRequired,
  toggleExpanded: PropTypes.func.isRequired,
  tier: PropTypes.number,
};

GroupSymbol.defaultProps = {
  tier: 1,
};


export class JobGroupComponent extends React.Component {
  constructor(props) {
    super(props);
    const { pushGroupState } = this.props;

    // The group should be expanded initially if the global group state is expanded
    const groupState = getUrlParam('group_state');

    this.state = {
      expanded: groupState === 'expanded' || pushGroupState === 'expanded',
    };
  }

  static getDerivedStateFromProps(nextProps, state) {
    // We should expand this group if it's own state is set to be expanded,
    // or if the push was set to have all groups expanded.
    return { expanded: state.expanded || nextProps.pushGroupState === 'expanded' };
  }

  setExpanded(isExpanded) {
    this.setState({ expanded: isExpanded });
  }

  toggleExpanded() {
    this.setState({ expanded: !this.state.expanded });
  }

  groupButtonsAndCounts(jobs, expanded) {
    const { selectedJob, duplicateJobsVisible, groupCountsExpanded } = this.props;
    let buttons = [];
    const counts = [];

    if (expanded || groupCountsExpanded) {
      // All buttons should be shown when the group is expanded
      buttons = jobs;
    } else {
      const stateCounts = {};
      const typeSymbolCounts = countBy(jobs, 'job_type_symbol');
      jobs.forEach((job) => {
        if (!job.visible) return;
        const status = getStatus(job);
        let countInfo = {
          btnClass: getBtnClass(status, job.failure_classification_id),
          countText: status,
        };
        if (thFailureResults.includes(status) ||
          (typeSymbolCounts[job.job_type_symbol] > 1 && duplicateJobsVisible)) {
          // render the job itself, not a count
          buttons.push(job);
        } else {
          countInfo = { ...countInfo, ...stateCounts[countInfo.btnClass] };
          if (selectedJob && selectedJob.id === job.id || countInfo.selectedClasses) {
            countInfo.selectedClasses = ' selected-count btn-lg-xform';
          } else {
            countInfo.selectedClasses = '';
          }
          if (stateCounts[countInfo.btnClass]) {
            countInfo.count = stateCounts[countInfo.btnClass].count + 1;
          } else {
            countInfo.count = 1;
          }
          countInfo.lastJob = job;
          stateCounts[countInfo.btnClass] = countInfo;
        }
      });
      Object.entries(stateCounts).forEach(([, countInfo]) => {
        if (countInfo.count === 1) {
          buttons.push(countInfo.lastJob);
        } else {
          counts.push(countInfo);
        }
      });
    }
    return { buttons, counts };
  }

  render() {
    const {
      repoName, filterPlatformCb, platform, filterModel,
      group: { name: groupName, symbol: groupSymbol, tier: groupTier, jobs: groupJobs, mapKey: groupMapKey },
    } = this.props;
    const { expanded } = this.state;
    const { buttons, counts } = this.groupButtonsAndCounts(groupJobs, expanded);

    this.toggleExpanded = this.toggleExpanded.bind(this);

    return (
      <span
        className="platform-group"
        data-group-key={groupMapKey}
      >
        <span
          className="disabled job-group"
          title={groupName}
        >
          <GroupSymbol
            symbol={groupSymbol}
            tier={groupTier}
            toggleExpanded={this.toggleExpanded}
          />
          <span className="group-content">
            <span className="group-job-list">
              {buttons.map(job => (
                <JobButton
                  job={job}
                  filterModel={filterModel}
                  visible={job.visible}
                  status={getStatus(job)}
                  failureClassificationId={job.failure_classification_id}
                  repoName={repoName}
                  filterPlatformCb={filterPlatformCb}
                  platform={platform}
                  key={job.id}
                />
              ))}
            </span>
            <span className="group-count-list">
              {counts.map(countInfo => (
                <JobCount
                  count={countInfo.count}
                  onClick={this.toggleExpanded}
                  className={`${countInfo.btnClass}-count${countInfo.selectedClasses}`}
                  title={`${countInfo.count} ${countInfo.countText} jobs in group`}
                  key={countInfo.lastJob.id}
                />
              ))}
            </span>
          </span>
        </span>
      </span>
    );
  }
}

JobGroupComponent.propTypes = {
  group: PropTypes.object.isRequired,
  repoName: PropTypes.string.isRequired,
  filterModel: PropTypes.object.isRequired,
  filterPlatformCb: PropTypes.func.isRequired,
  platform: PropTypes.object.isRequired,
  pushGroupState: PropTypes.string.isRequired,
  duplicateJobsVisible: PropTypes.bool.isRequired,
  groupCountsExpanded: PropTypes.bool.isRequired,
  selectedJob: PropTypes.object,
};

JobGroupComponent.defaultProps = {
  selectedJob: null,
};

export default withSelectedJob(JobGroupComponent);
