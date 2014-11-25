#!/bin/sh
# usage: fpm-create.sh <iteration number> <push-to-repo (true/false)>

if [[ "${IS_M2RELEASEBUILD}" == "true" ]]; then
    echo "Release build detected (IS_M2RELEASEBUILD set to $IS_M2RELEASEBUILD) so not creating an RPM"
    exit 0
fi

APP_NAME=environment-health
APP_JAR=${APP_NAME}-*.jar
#APP_YML=config/${APP_NAME}.yml
APP_SERVICE_SCRIPT=bin/${APP_NAME}-service_redhat
WORK_DIR=`pwd`

# EXTRACT RELEASE AND BUILD NUMBER FROM THE ZIP FILE
VERSION_NO=`echo ${APP_JAR} | awk -F"/${APP_NAME}-" '{print $NF}' | awk -F'-' '{print $1}'`

if [ "$VERSION_NO" = "" ] ; then
  echo "ERROR: Something went wrong in determining release and build number from ${APP_JAR}"
  exit 1
fi

run_cmd() {
  $*
  if [[ $? -ne 0 ]]; then
    echo "Failed to run command $*"
    exit 1
  fi    
}

# run the script relative to the script dir
cd `dirname $0`

# Allow the jenkins build number to be passed as an arg - use it as the iteration number
ITERATION_NO=${1:-"0"}
PUSH_TO_REPO=${2:-"false"}

################
# Create target directory with contents
################
# delete any old RPMs
rm -rf ../target
mkdir -p ../target

cd ../target
mkdir -p ldirect/dropwizard/${APP_NAME}
mkdir -p etc/init.d/ var/log/dropwizard/
echo "WORKDIR= ${WORK_DIR}"
echo "APPJAR= ${APP_JAR}"
cp ${APP_JAR} ldirect/dropwizard/${APP_NAME}/${APP_NAME}.jar
cp ${WORK_DIR}/${APP_YML} ldirect/dropwizard/${APP_NAME}/
cp ${WORK_DIR}/${APP_SERVICE_SCRIPT} etc/init.d/${APP_NAME}
chmod +x etc/init.d/${APP_NAME}

###################
# Generate a properties file containing the requried info for downstream pipeline jobs
###################

JOB_NAME=${APP_NAME}
RPM_ARCH=noarch
RPM_REPO_URL=http://ca01rpm01.cdev.learndirect.co.uk/ld-optional/6/x86_64/releases
RPM_APP_PACKAGE=${APP_NAME}
RPM_DB_PACKAGE=

cat > ${WORK_DIR}/version.properties <<DELIM
JOB_NAME=${JOB_NAME}
APP_NAME=${JOB_NAME}
RELEASE_NUMBER=${VERSION_NO}
BUILD_NUMBER=${ITERATION_NO}
APP_VERSION=${VERSION_NO}-${ITERATION_NO}
RPM_PACKAGE_VERSION=${VERSION_NO}-${ITERATION_NO}
RPM_APP_PACKAGE=${RPM_APP_PACKAGE}
RPM_DB_PACKAGE=
RPM_APP_PACKAGE_URL=${RPM_REPO_URL}/${RPM_APP_PACKAGE}-${VERSION_NO}-${BUILD_NUMBER}.${RPM_ARCH}.rpm
RPM_DB_PACKAGE_URL=
DELIM

RPM_APP_PACKAGE_UNDERSCORES=${RPM_APP_PACKAGE/-/_}

################
# Create app rpm
################
echo "Creating application rpm..."
run_cmd fpm -s dir -t rpm -n $RPM_APP_PACKAGE_UNDERSCORES -v $VERSION_NO -a $RPM_ARCH \
  --rpm-user dwizard --rpm-group dwizard \
  --before-install ${WORK_DIR}/bin/pre-install.sh \
  --epoch 0 -C . --iteration ${BUILD_NUMBER} .

###################
# Copy the RPMS to PULP YUM server and update repo
###################

PUSH_TO_REPO=true

###################
# Copy the RPMS to YUM server and update repo
###################
# now copy to the releases yum repo and update
if [ "$PUSH_TO_REPO" = "true" ] ; then
  scp *.rpm jenkins@S2VLDEVREPC01:/var/www/pub/https/repos/ldsoftware-dev/
  RET_CODE=$?
  if [ "$RET_CODE" != "0" ] ; then
    echo "ERROR: failed to copy RPM to yum repository"
    exit 1
  fi
  # The yum/rpm/satellite server will automatically pickup and create it's metadata within 2 minutes
fi


## now copy to the releases PULP yum repo and update
#if [ "$PUSH_TO_REPO" = "true" ] ; then
##  RPMS=`ls -1 *.rpm`
#  FILE_ARGS=""
#  for rpm in $RPMS ; do
#    FILE_ARGS="${FILE_ARGS} --file ${rpm}"
#  done
#
##  # NOTE - the following script require "pulp-admin login -u XXX -p XXX" command to be run first to pre-authenticate
#  # Upload RPMs
#  run_cmd pulp-admin rpm repo uploads rpm --repo-id ldsoftware-dev ${FILE_ARGS}
#  # Finally, publish the repo
#  run_cmd pulp-admin rpm repo publish run --repo-id ldsoftware-dev
#fi
#
